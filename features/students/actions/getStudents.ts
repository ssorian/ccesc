"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { StudentStatus } from "@/lib/types"

const schema = z.object({
    search: z.string().optional(),
    status: z.nativeEnum(StudentStatus).optional(),
    careerId: z.string().optional(),
    institutionId: z.string().optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().optional(),
}).default({})

export const getStudents = authAction(schema, async (filters) => {
    const { search, status, careerId, institutionId, page = 1, pageSize = 10 } = filters
    const conditions: string[] = [`s."deletedAt" IS NULL`]
    const params: unknown[] = []
    let i = 1

    if (status != null) { conditions.push(`s.status = $${i++}`); params.push(status) }
    if (careerId != null) { conditions.push(`s."careerId" = $${i++}`); params.push(careerId) }
    if (institutionId != null) { conditions.push(`s."institutionId" = $${i++}`); params.push(institutionId) }
    if (search != null) {
        conditions.push(`(u.name ILIKE $${i} OR u."lastName" ILIKE $${i} OR s."enrollmentId" ILIKE $${i} OR s.curp ILIKE $${i})`)
        params.push(`%${search}%`); i++
    }

    const where = conditions.join(" AND ")
    const offset = (page - 1) * pageSize
    const countParams = [...params]
    const dataParams = [...params, pageSize, offset]

    const [{ rows }, { rows: countRows }] = await Promise.all([
        db.query(
            `SELECT s.*,
                json_build_object('id', u.id, 'name', u.name, 'lastName', u."lastName", 'email', u.email) AS "user",
                CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'code', c.code) ELSE NULL END AS career,
                json_build_object('id', inst.id, 'slug', inst.slug, 'name', iu.name) AS institution
             FROM "Student" s
             JOIN "User" u ON u.id = s."userId"
             LEFT JOIN "Career" c ON c.id = s."careerId"
             JOIN "Institution" inst ON inst.id = s."institutionId"
             JOIN "User" iu ON iu.id = inst."userId"
             WHERE ${where}
             ORDER BY s."createdAt" DESC
             LIMIT $${i} OFFSET $${i + 1}`,
            dataParams,
        ),
        db.query(
            `SELECT COUNT(*)::int AS total FROM "Student" s JOIN "User" u ON u.id = s."userId" WHERE ${where}`,
            countParams,
        ),
    ])

    return { students: rows, total: countRows[0].total, page, pageSize }
})

export type GetStudentsFilters = z.input<typeof schema>
