"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { GroupType } from "@/lib/types"

const schema = z.object({
    institutionId: z.string().optional(),
    careerId: z.string().optional(),
    groupType: z.nativeEnum(GroupType).optional(),
    schoolYearId: z.string().optional(),
    semester: z.number().int().positive().optional(),
}).default({})

export const getGroups = authAction(schema, async ({ institutionId, careerId, groupType, schoolYearId, semester }) => {
    const conditions: string[] = [`g."deletedAt" IS NULL`]
    const params: unknown[] = []
    let i = 1

    if (institutionId != null) { conditions.push(`g."institutionId" = $${i++}`); params.push(institutionId) }
    if (careerId != null) { conditions.push(`g."careerId" = $${i++}`); params.push(careerId) }
    if (groupType != null) { conditions.push(`g."groupType" = $${i++}`); params.push(groupType) }
    if (schoolYearId != null) { conditions.push(`g."schoolYearId" = $${i++}`); params.push(schoolYearId) }
    if (semester != null) { conditions.push(`g.semester = $${i++}`); params.push(semester) }

    const { rows } = await db.query(
        `SELECT g.*,
            CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name) ELSE NULL END AS career,
            json_build_object('id', inst.id, 'slug', inst.slug, 'name', u.name) AS institution,
            json_build_object('id', sy.id, 'name', sy.name) AS "schoolYear",
            (SELECT COUNT(*) FROM "StudentGroup" sg WHERE sg."groupId" = g.id)::int AS student_count,
            (SELECT COUNT(*) FROM "TeacherGroup" tg WHERE tg."groupId" = g.id)::int AS teacher_count
         FROM "Group" g
         LEFT JOIN "Career" c ON c.id = g."careerId"
         JOIN "Institution" inst ON inst.id = g."institutionId"
         JOIN "User" u ON u.id = inst."userId"
         JOIN "SchoolYear" sy ON sy.id = g."schoolYearId"
         WHERE ${conditions.join(" AND ")}
         ORDER BY sy."startDate" DESC, g.name ASC`,
        params,
    )

    return rows.map((r) => ({
        ...r,
        _count: { studentGroups: r.student_count, teacherGroups: r.teacher_count },
    }))
})

export type GetGroupsFilters = z.input<typeof schema>
