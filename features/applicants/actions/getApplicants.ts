"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { ApplicantStatus } from "@/lib/types"

const schema = z.object({
    institutionCareerId: z.string().optional(),
    status: z.nativeEnum(ApplicantStatus).optional(),
    search: z.string().optional(),
    skip: z.number().int().nonnegative().optional(),
    take: z.number().int().positive().optional(),
}).default({})

export const getApplicants = authAction(schema, async ({ institutionCareerId, status, search, skip, take }) => {
    const conditions: string[] = []
    const params: unknown[] = []
    let i = 1
    if (institutionCareerId) { conditions.push(`a."institutionCareerId" = $${i++}`); params.push(institutionCareerId) }
    if (status) { conditions.push(`a.status = $${i++}`); params.push(status) }
    if (search) {
        conditions.push(`(a.name ILIKE $${i} OR a."lastName" ILIKE $${i} OR a.curp ILIKE $${i} OR a.email ILIKE $${i})`)
        params.push(`%${search}%`); i++
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    const limitClause = take != null ? `LIMIT $${i++}` : ""
    const offsetClause = skip != null ? `OFFSET $${i++}` : ""
    if (take != null) params.push(take)
    if (skip != null) params.push(skip)

    const { rows } = await db.query(
        `SELECT a.*,
            json_build_object(
                'id', ic.id, 'institutionId', ic."institutionId", 'careerId', ic."careerId",
                'career', json_build_object('id', c.id, 'name', c.name, 'code', c.code),
                'institution', json_build_object('id', inst.id, 'slug', inst.slug, 'name', u.name)
            ) AS "institutionCareer"
         FROM "Applicant" a
         JOIN "InstitutionCareer" ic ON ic.id = a."institutionCareerId"
         JOIN "Career" c ON c.id = ic."careerId"
         JOIN "Institution" inst ON inst.id = ic."institutionId"
         JOIN "User" u ON u.id = inst."userId"
         ${where} ORDER BY a."createdAt" DESC ${limitClause} ${offsetClause}`,
        params,
    )
    return rows
})

export type GetApplicantsFilters = z.input<typeof schema>
