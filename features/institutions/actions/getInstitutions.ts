"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"

export const getInstitutions = authAction(null, async () => {
    const { rows } = await db.query(
        `SELECT i.*, u.name,
            (SELECT COUNT(*) FROM "Student" s WHERE s."institutionId" = i.id AND s."deletedAt" IS NULL)::int AS student_count,
            (SELECT COUNT(*) FROM "Teacher" t WHERE t."institutionId" = i.id AND t."deletedAt" IS NULL)::int AS teacher_count,
            (SELECT COUNT(*) FROM "Group" g WHERE g."institutionId" = i.id AND g."deletedAt" IS NULL)::int AS group_count
         FROM "Institution" i
         JOIN "User" u ON u.id = i."userId"
         WHERE i."deletedAt" IS NULL
         ORDER BY u.name ASC`,
    )
    return rows.map((r) => ({
        ...r,
        _count: { students: r.student_count, teachers: r.teacher_count, groups: r.group_count },
    }))
})
