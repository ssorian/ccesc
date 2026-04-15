"use server"

import prisma from "@/lib/prisma"
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
    const groups = await prisma.group.findMany({
        where: {
            deletedAt: null,
            ...(institutionId != null && { institutionId }),
            ...(careerId != null && { careerId }),
            ...(groupType != null && { groupType }),
            ...(schoolYearId != null && { schoolYearId }),
            ...(semester != null && { semester }),
        },
        include: {
            career: { select: { id: true, name: true } },
            institution: { select: { id: true, slug: true, user: { select: { name: true } } } },
            schoolYear: { select: { id: true, name: true } },
            _count: { select: { studentGroups: true, teacherGroups: true } },
        },
        orderBy: [{ schoolYear: { startDate: "desc" } }, { name: "asc" }],
    })

    return groups.map((g) => ({
        ...g,
        institution: { id: g.institution.id, slug: g.institution.slug, name: g.institution.user.name },
    }))
})

export type GetGroupsFilters = z.input<typeof schema>
