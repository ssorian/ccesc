"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getTeacherById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows } = await db.query(
        `SELECT t.*,
            json_build_object('id', u.id, 'name', u.name, 'lastName', u."lastName", 'email', u.email, 'image', u.image) AS "user",
            json_build_object('id', inst.id, 'slug', inst.slug, 'name', iu.name) AS institution
         FROM "Teacher" t
         JOIN "User" u ON u.id = t."userId"
         JOIN "Institution" inst ON inst.id = t."institutionId"
         JOIN "User" iu ON iu.id = inst."userId"
         WHERE t.id = $1`,
        [id],
    )
    if (rows.length === 0) return null
    const teacher = rows[0]

    const { rows: tgRows } = await db.query(
        `SELECT tg.*,
            g.id AS g_id, g.name AS g_name, g."groupType", g.semester,
            CASE WHEN gc.id IS NOT NULL THEN json_build_object('id', gc.id, 'name', gc.name) ELSE NULL END AS g_career,
            c.id AS c_id, c.name AS c_name, c.code AS c_code
         FROM "TeacherGroup" tg
         JOIN "Group" g ON g.id = tg."groupId"
         LEFT JOIN "Career" gc ON gc.id = g."careerId"
         LEFT JOIN "Course" c ON c.id = tg."courseId"
         WHERE tg."teacherId" = $1`,
        [id],
    )

    return {
        ...teacher,
        teacherGroups: tgRows.map((r) => ({
            id: r.id, groupId: r.groupId, courseId: r.courseId, role: r.role,
            group: { id: r.g_id, name: r.g_name, groupType: r.groupType, semester: r.semester, career: r.g_career },
            course: r.c_id ? { id: r.c_id, name: r.c_name, code: r.c_code } : null,
        })),
    }
})
