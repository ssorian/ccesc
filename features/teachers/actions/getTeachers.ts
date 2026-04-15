"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { TeacherStatus } from "@/lib/types"

const schema = z.object({
    search: z.string().optional(),
    status: z.nativeEnum(TeacherStatus).optional(),
    institutionId: z.string().optional(),
}).default({})

export const getTeachers = authAction(schema, async ({ search, status, institutionId }) => {
    const conditions: string[] = [`t."deletedAt" IS NULL`]
    const params: unknown[] = []
    let i = 1

    if (status != null) { conditions.push(`t.status = $${i++}`); params.push(status) }
    if (institutionId != null) { conditions.push(`t."institutionId" = $${i++}`); params.push(institutionId) }
    if (search != null) {
        conditions.push(`(u.name ILIKE $${i} OR u."lastName" ILIKE $${i} OR t."employeeId" ILIKE $${i})`)
        params.push(`%${search}%`); i++
    }

    const { rows } = await db.query(
        `SELECT t.*,
            json_build_object('id', u.id, 'name', u.name, 'lastName', u."lastName", 'email', u.email, 'image', u.image) AS "user",
            json_build_object('id', inst.id, 'slug', inst.slug, 'name', iu.name) AS institution
         FROM "Teacher" t
         JOIN "User" u ON u.id = t."userId"
         JOIN "Institution" inst ON inst.id = t."institutionId"
         JOIN "User" iu ON iu.id = inst."userId"
         WHERE ${conditions.join(" AND ")}
         ORDER BY t."createdAt" DESC`,
        params,
    )
    return rows
})

export type GetTeachersFilters = z.input<typeof schema>
