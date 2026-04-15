"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getAttendance = authAction(
    z.object({ groupId: z.string(), unitId: z.string(), sessionDate: z.coerce.date() }),
    async ({ groupId, unitId, sessionDate }) => {
        const dayStart = new Date(sessionDate.toDateString())
        const dayEnd = new Date(dayStart.getTime() + 86400000)

        const { rows } = await db.query(
            `SELECT sg."studentId",
                s.id AS s_id, s."enrollmentId", s.status AS s_status,
                u.id AS u_id, u.name AS u_name, u."lastName" AS u_last_name,
                e.id AS e_id,
                att.id AS att_id, att.present, att.justified, att.notes
             FROM "StudentGroup" sg
             JOIN "Student" s ON s.id = sg."studentId"
             JOIN "User" u ON u.id = s."userId"
             LEFT JOIN "Enrollment" e ON e."studentId" = s.id AND e."groupId" = $1
             LEFT JOIN "Attendance" att ON att."enrollmentId" = e.id AND att."unitId" = $2
                AND att."sessionDate" >= $3 AND att."sessionDate" < $4
             WHERE sg."groupId" = $1`,
            [groupId, unitId, dayStart, dayEnd],
        )

        return rows.map((r) => ({
            student: { id: r.s_id, enrollmentId: r.enrollmentId, status: r.s_status, user: { id: r.u_id, name: r.u_name, lastName: r.u_last_name } },
            enrollment: r.e_id ? { id: r.e_id } : null,
            attendance: r.att_id ? { id: r.att_id, present: r.present, justified: r.justified, notes: r.notes } : null,
        }))
    },
)
