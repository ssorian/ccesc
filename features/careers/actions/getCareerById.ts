"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getCareerById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const career = await prisma.career.findUnique({
        where: { id },
        include: {
            courses: {
                where: { deletedAt: null },
                orderBy: [{ semester: "asc" }, { name: "asc" }],
            },
            groups: {
                where: { deletedAt: null },
                include: {
                    _count: { select: { studentGroups: true } },
                },
            },
            _count: {
                select: { students: { where: { deletedAt: null } } },
            },
        },
    })
    if (!career) return null

    return {
        ...career,
        _count: {
            students: career._count.students,
            courses: career.courses.length,
        },
    }
})
