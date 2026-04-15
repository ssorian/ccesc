"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { GradeType } from "@/lib/types"

export const PASS_THRESHOLD = 6.0

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
    const isExtraordinary = gradeType === "EXTRAORDINARY"

    const [unit, enrollment] = await Promise.all([
        prisma.unit.findUnique({ where: { id: unitId }, select: { unitNumber: true } }),
        prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            select: {
                studentId: true,
                schoolYearId: true,
                group: {
                    select: {
                        institution: {
                            select: { id: true, enableGlobalEvaluation: true, globalEvaluationWeight: true },
                        },
                    },
                },
            },
        }),
    ])

    if (!unit) throw new Error("UNIT_NOT_FOUND")
    if (!enrollment) throw new Error("ENROLLMENT_NOT_FOUND")
    if (!enrollment.group?.institution) throw new Error("ENROLLMENT_GROUP_NOT_FOUND")

    // Extraordinary: validate student failed ordinary
    if (isExtraordinary) {
        const ordinaryGrades = await prisma.unitGrade.findMany({
            where: { enrollmentId, gradeType: "ORDINARY", grade: { not: null } },
            include: { unit: { select: { weight: true } } },
        })

        if (ordinaryGrades.length === 0) throw new Error("EXTRAORDINARY_NOT_ELIGIBLE")

        const institution = enrollment.group!.institution!
        const totalWeight = ordinaryGrades.reduce((acc, g) => acc + Number(g.unit.weight), 0)
        const weightedSum = ordinaryGrades.reduce((acc, g) => acc + Number(g.grade!) * Number(g.unit.weight), 0)
        let ordinaryAverage = totalWeight > 0 ? weightedSum / totalWeight : null

        if (institution.enableGlobalEvaluation && ordinaryAverage != null) {
            const enroll = await prisma.enrollment.findUnique({
                where: { id: enrollmentId },
                select: { globalEvaluationGrade: true },
            })
            if (enroll?.globalEvaluationGrade != null) {
                const w = Number(institution.globalEvaluationWeight)
                ordinaryAverage = ordinaryAverage * (1 - w) + Number(enroll.globalEvaluationGrade) * w
            }
        }

        if (ordinaryAverage === null || ordinaryAverage >= PASS_THRESHOLD) {
            throw new Error("EXTRAORDINARY_NOT_ELIGIBLE")
        }
    }

    // Lookup evaluation period — ordinary uses unit number, extraordinary uses any open extraordinary period
    const period = isExtraordinary
        ? await prisma.evaluationPeriod.findFirst({
            where: { schoolYearId: enrollment.schoolYearId, isExtraordinary: true, status: "OPEN" },
            select: { id: true, status: true },
        })
        : await prisma.evaluationPeriod.findUnique({
            where: {
                schoolYearId_evaluationNumber_isExtraordinary: {
                    schoolYearId: enrollment.schoolYearId,
                    evaluationNumber: unit.unitNumber,
                    isExtraordinary: false,
                },
            },
            select: { id: true, status: true },
        })

    if (!period) throw new Error("PERIOD_NOT_FOUND")
    if (period.status !== "OPEN") throw new Error("PERIOD_CLOSED")

    const existingGrade = await prisma.unitGrade.findUnique({
        where: { id: unitGradeId },
        select: { grade: true },
    })
    const oldGrade = existingGrade?.grade ?? null

    const result = await prisma.$transaction(async (tx) => {
        const { count } = await tx.unitGrade.updateMany({
            where: { id: unitGradeId, version },
            data: {
                grade,
                comments: comments ?? null,
                assignedById: session.user.id,
                evaluationPeriodId: period.id,
                version: { increment: 1 },
            },
        })
        if (count === 0) throw new Error("OPTIMISTIC_LOCK_ERROR")

        await tx.unitGradeAuditLog.create({
            data: {
                unitGradeId,
                oldGrade,
                newGrade: grade,
                userId: session.user.id,
                reason: reason ?? null,
            },
        })

        if (isExtraordinary) {
            // Recalculate extraordinary weighted average
            const allExtraordinaryGrades = await tx.unitGrade.findMany({
                where: { enrollmentId, gradeType: "EXTRAORDINARY", grade: { not: null } },
                include: { unit: { select: { weight: true } } },
            })

            const totalWeight = allExtraordinaryGrades.reduce((acc, g) => acc + Number(g.unit.weight), 0)
            const weightedSum = allExtraordinaryGrades.reduce((acc, g) => acc + Number(g.grade!) * Number(g.unit.weight), 0)
            const extraordinaryAverage = totalWeight > 0 ? weightedSum / totalWeight : null

            if (extraordinaryAverage !== null) {
                await tx.enrollment.update({
                    where: { id: enrollmentId },
                    data: { finalGrade: extraordinaryAverage },
                })
            }

            return tx.unitGrade.findUnique({ where: { id: unitGradeId } })
        }

        // Ordinary: recalculate weighted average across all entered ordinary grades
        const allGrades = await tx.unitGrade.findMany({
            where: { enrollmentId, gradeType: "ORDINARY", grade: { not: null } },
            include: { unit: { select: { weight: true } } },
        })

        const totalWeight = allGrades.reduce((acc, g) => acc + Number(g.unit.weight), 0)
        const weightedSum = allGrades.reduce((acc, g) => acc + Number(g.grade!) * Number(g.unit.weight), 0)
        const unitsAverage = totalWeight > 0 ? weightedSum / totalWeight : null

        const institution = enrollment.group!.institution!
        let finalGrade: number | null = unitsAverage

        if (institution.enableGlobalEvaluation && unitsAverage != null) {
            const enroll = await tx.enrollment.findUnique({
                where: { id: enrollmentId },
                select: { globalEvaluationGrade: true },
            })
            if (enroll?.globalEvaluationGrade != null) {
                const w = Number(institution.globalEvaluationWeight)
                finalGrade = unitsAverage * (1 - w) + Number(enroll.globalEvaluationGrade) * w
            }
        }

        await tx.enrollment.update({
            where: { id: enrollmentId },
            data: { unitsAverage, finalGrade },
        })

        return tx.unitGrade.findUnique({ where: { id: unitGradeId } })
    })

    revalidatePath("/profesores/calificaciones")
    return result
})
