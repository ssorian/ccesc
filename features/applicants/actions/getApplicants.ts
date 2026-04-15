"use server"

import prisma from "@/lib/prisma"
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
    const applicants = await prisma.applicant.findMany({
        where: {
            ...(institutionCareerId && { institutionCareerId }),
            ...(status && { status }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { curp: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            }),
        },
        include: {
            institutionCareer: {
                include: {
                    career: { select: { id: true, name: true, code: true } },
                    institution: {
                        select: { id: true, slug: true, user: { select: { name: true } } },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
        ...(skip != null && { skip }),
        ...(take != null && { take }),
    })

    return applicants.map((a) => ({
        ...a,
        institutionCareer: {
            ...a.institutionCareer,
            institution: {
                id: a.institutionCareer.institution.id,
                slug: a.institutionCareer.institution.slug,
                name: a.institutionCareer.institution.user.name,
            },
        },
    }))
})

export type GetApplicantsFilters = z.input<typeof schema>
