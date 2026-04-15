"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"

export const getInstitutions = authAction(null, async () => {
    const institutions = await prisma.institution.findMany({
        where: { deletedAt: null },
        include: {
            user: { select: { name: true } },
            _count: {
                select: {
                    students: { where: { deletedAt: null } },
                    teachers: { where: { deletedAt: null } },
                    groups: { where: { deletedAt: null } },
                },
            },
        },
        orderBy: { user: { name: "asc" } },
    })

    return institutions.map((i) => ({
        ...i,
        name: i.user.name,
    }))
})
