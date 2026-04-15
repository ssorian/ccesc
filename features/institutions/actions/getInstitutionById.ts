"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getInstitutionById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const institution = await prisma.institution.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, lastName: true, email: true, role: true } },
            institutionCareers: {
                include: {
                    career: { select: { id: true, name: true, code: true } },
                },
            },
            _count: {
                select: {
                    students: { where: { deletedAt: null } },
                    teachers: { where: { deletedAt: null } },
                    groups: { where: { deletedAt: null } },
                },
            },
        },
    })
    if (!institution) return null

    return {
        ...institution,
        name: institution.user.name,
    }
})
