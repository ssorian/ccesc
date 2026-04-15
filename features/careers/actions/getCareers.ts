"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"

export const getCareers = authAction(null, async () => {
    const { rows } = await db.query(
        `SELECT c.*,
            (SELECT COUNT(*) FROM "Student" s WHERE s."careerId" = c.id AND s."deletedAt" IS NULL)::int AS student_count,
            (SELECT COUNT(*) FROM "Course" co WHERE co."careerId" = c.id AND co."deletedAt" IS NULL)::int AS course_count,
            (SELECT COUNT(*) FROM "Group" g WHERE g."careerId" = c.id AND g."deletedAt" IS NULL)::int AS group_count
         FROM "Career" c
         WHERE c."deletedAt" IS NULL
         ORDER BY c.name ASC`,
    )
    return rows.map((r) => ({
        ...r,
        _count: { students: r.student_count, courses: r.course_count, groups: r.group_count },
    }))
})
