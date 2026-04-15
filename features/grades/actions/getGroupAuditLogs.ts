"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getGroupAuditLogs = authAction(
    z.object({ groupId: z.string() }),
    async ({ groupId }) => {
        const { rows } = await db.query(
            `SELECT
                al.id, al."unitGradeId", al."oldGrade", al."newGrade", al."userId", al.reason, al."createdAt",
                ug."enrollmentId", ug."unitId", ug."gradeType",
                un.id AS unit_id, un."unitNumber", un.name AS unit_name,
                s.id AS student_id,
                u.id AS user_id, u.name AS user_name, u."lastName" AS user_last_name
             FROM "UnitGradeAuditLog" al
             JOIN "UnitGrade" ug ON ug.id = al."unitGradeId"
             JOIN "Unit" un ON un.id = ug."unitId"
             JOIN "Enrollment" e ON e.id = ug."enrollmentId"
             JOIN "Student" s ON s.id = e."studentId"
             JOIN "User" u ON u.id = s."userId"
             WHERE e."groupId" = $1
             ORDER BY al."createdAt" DESC`,
            [groupId],
        )

        return rows.map((r) => ({
            id: r.id,
            unitGradeId: r.unitGradeId,
            oldGrade: r.oldGrade,
            newGrade: r.newGrade,
            userId: r.userId,
            reason: r.reason,
            createdAt: r.createdAt,
            unitGrade: {
                id: r.unitGradeId,
                enrollmentId: r.enrollmentId,
                unitId: r.unitId,
                gradeType: r.gradeType,
                unit: { id: r.unit_id, unitNumber: r.unitNumber, name: r.unit_name },
                enrollment: {
                    student: {
                        id: r.student_id,
                        user: { id: r.user_id, name: r.user_name, lastName: r.user_last_name },
                    },
                },
            },
        }))
    },
)
