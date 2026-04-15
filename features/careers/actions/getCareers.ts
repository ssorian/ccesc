"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"

export const getCareers = authAction(null, async () => {
    const careers = await prisma.career.findMany({
        where: { deletedAt: null },
        include: {
            _count: {
                select: {
                    students: { where: { deletedAt: null } },
                    courses: { where: { deletedAt: null } },
                    groups: { where: { deletedAt: null } },
                },
            },
        },
        orderBy: { name: "asc" },
    })
    return careers
})
