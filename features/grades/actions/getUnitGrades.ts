"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getUnitGrades = authAction(
    z.object({ groupId: z.string(), unitId: z.string() }),
    async ({ groupId, unitId }) => {
        const { rows } = await db.query(
            `SELECT
                sg."studentId",
                u.id AS user_id, u.name AS user_name, u."lastName" AS user_last_name,
                s.id AS student_id, s."enrollmentId", s.status AS student_status,
                e.id AS enrollment_id,
                ug.id AS unit_grade_id, ug.grade, ug.version, ug."gradeType",
                ug."unitId" AS ug_unit_id,
                un."unitNumber", un.name AS unit_name
             FROM "StudentGroup" sg
             JOIN "Student" s ON s.id = sg."studentId"
             JOIN "User" u ON u.id = s."userId"
             LEFT JOIN "Enrollment" e ON e."studentId" = s.id AND e."groupId" = $1
             LEFT JOIN "UnitGrade" ug ON ug."enrollmentId" = e.id AND ug."unitId" = $2
             LEFT JOIN "Unit" un ON un.id = ug."unitId"
             WHERE sg."groupId" = $1`,
            [groupId, unitId],
        )

        return rows.map((r) => ({
            student: {
                id: r.student_id,
                enrollmentId: r.enrollmentId,
                status: r.student_status,
                user: { id: r.user_id, name: r.user_name, lastName: r.user_last_name },
            },
            enrollment: r.enrollment_id
                ? { id: r.enrollment_id }
                : null,
            unitGrade: r.unit_grade_id
                ? {
                      id: r.unit_grade_id,
                      grade: r.grade,
                      version: r.version,
                      gradeType: r.gradeType,
                      unitId: r.ug_unit_id,
                      unit: { id: r.ug_unit_id, unitNumber: r.unitNumber, name: r.unit_name },
                  }
                : null,
        }))
    },
)
