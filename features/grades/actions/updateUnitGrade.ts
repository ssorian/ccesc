"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { GradeType } from "@/lib/types"

const schema = z.object({
    enrollmentId: z.string(),
    unitId: z.string(),
    unitGradeId: z.string(),
    version: z.number().int(),
    grade: z.number().min(0).max(10),
    gradeType: z.nativeEnum(GradeType).optional(),
    comments: z.string().optional(),
    reason: z.string().optional(),
})

export const updateUnitGrade = authAction(schema, async (
    { enrollmentId, unitId, unitGradeId, version, grade, gradeType = "ORDINARY", comments, reason },
    session
) => {
    const [{ rows: unitRows }, { rows: enrollRows }] = await Promise.all([
        db.query(`SELECT "unitNumber" FROM "Unit" WHERE id = $1`, [unitId]),
        db.query(
            `SELECT e."schoolYearId",
                i.id AS institution_id, i."enableGlobalEvaluation", i."globalEvaluationWeight"
             FROM "Enrollment" e
             LEFT JOIN "Group" g ON g.id = e."groupId"
             LEFT JOIN "Institution" i ON i.id = g."institutionId"
             WHERE e.id = $1`,
            [enrollmentId],
        ),
    ])

    if (unitRows.length === 0) throw new Error("UNIT_NOT_FOUND")
    if (enrollRows.length === 0) throw new Error("ENROLLMENT_NOT_FOUND")
    if (!enrollRows[0].institution_id) throw new Error("ENROLLMENT_GROUP_NOT_FOUND")

    const { schoolYearId } = enrollRows[0]
    const unitNumber = unitRows[0].unitNumber

    const { rows: periodRows } = await db.query(
        `SELECT id, status FROM "EvaluationPeriod"
         WHERE "schoolYearId" = $1 AND "evaluationNumber" = $2 AND "isExtraordinary" = false`,
        [schoolYearId, unitNumber],
    )
    if (periodRows.length === 0) throw new Error("PERIOD_NOT_FOUND")
    if (periodRows[0].status !== "OPEN") throw new Error("PERIOD_CLOSED")

    const periodId = periodRows[0].id

    const { rows: existingRows } = await db.query(
        `SELECT grade FROM "UnitGrade" WHERE id = $1`,
        [unitGradeId],
    )
    const oldGrade = existingRows[0]?.grade ?? null

    const result = await withTransaction(async (client) => {
        // OCC update — fails silently if version mismatch (0 rows)
        const { rows: updated, rowCount } = await client.query(
            `UPDATE "UnitGrade"
             SET grade = $1, comments = $2, "assignedById" = $3, "evaluationPeriodId" = $4,
                 version = version + 1, "updatedAt" = NOW()
             WHERE id = $5 AND version = $6
             RETURNING *`,
            [grade, comments ?? null, session.user.id, periodId, unitGradeId, version],
        )
        if (rowCount === 0) throw new Error("OPTIMISTIC_LOCK_ERROR")

        await client.query(
            `INSERT INTO "UnitGradeAuditLog" (id, "unitGradeId", "oldGrade", "newGrade", "userId", reason, "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [crypto.randomUUID(), unitGradeId, oldGrade, grade, session.user.id, reason ?? null],
        )

        // Recalculate unitsAverage
        const { rows: allGrades } = await client.query(
            `SELECT ug.grade, u.weight
             FROM "UnitGrade" ug
             JOIN "Unit" u ON u.id = ug."unitId"
             WHERE ug."enrollmentId" = $1 AND ug."gradeType" = 'ORDINARY' AND ug.grade IS NOT NULL`,
            [enrollmentId],
        )

        const totalWeight = allGrades.reduce((acc, g) => acc + Number(g.weight), 0)
        const weightedSum = allGrades.reduce((acc, g) => acc + Number(g.grade) * Number(g.weight), 0)
        const unitsAverage = totalWeight > 0 ? weightedSum / totalWeight : null

        const institution = enrollRows[0]
        let finalGrade: number | null = unitsAverage

        if (institution.enableGlobalEvaluation && unitsAverage != null) {
            const { rows: enrollFull } = await client.query(
                `SELECT "globalEvaluationGrade" FROM "Enrollment" WHERE id = $1`,
                [enrollmentId],
            )
            if (enrollFull[0]?.globalEvaluationGrade != null) {
                const w = Number(institution.globalEvaluationWeight)
                finalGrade = unitsAverage * (1 - w) + Number(enrollFull[0].globalEvaluationGrade) * w
            }
        }

        await client.query(
            `UPDATE "Enrollment" SET "unitsAverage" = $1, "finalGrade" = $2, "updatedAt" = NOW() WHERE id = $3`,
            [unitsAverage, finalGrade, enrollmentId],
        )

        return updated[0]
    })

    revalidatePath("/profesores/calificaciones")
    return result
})
