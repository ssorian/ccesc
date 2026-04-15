"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getInstitutionById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows } = await db.query(
        `SELECT i.*,
            json_build_object('id', u.id, 'name', u.name, 'lastName', u."lastName", 'email', u.email, 'role', u.role) AS "user",
            (SELECT COUNT(*) FROM "Student" s WHERE s."institutionId" = i.id AND s."deletedAt" IS NULL)::int AS student_count,
            (SELECT COUNT(*) FROM "Teacher" t WHERE t."institutionId" = i.id AND t."deletedAt" IS NULL)::int AS teacher_count,
            (SELECT COUNT(*) FROM "Group" g WHERE g."institutionId" = i.id AND g."deletedAt" IS NULL)::int AS group_count
         FROM "Institution" i JOIN "User" u ON u.id = i."userId"
         WHERE i.id = $1`,
        [id],
    )
    if (rows.length === 0) return null
    const inst = rows[0]

    const { rows: icRows } = await db.query(
        `SELECT ic.*, json_build_object('id', c.id, 'name', c.name, 'code', c.code) AS career
         FROM "InstitutionCareer" ic JOIN "Career" c ON c.id = ic."careerId"
         WHERE ic."institutionId" = $1`,
        [id],
    )

    return {
        ...inst,
        name: inst.user.name,
        institutionCareers: icRows,
        _count: { students: inst.student_count, teachers: inst.teacher_count, groups: inst.group_count },
    }
})
