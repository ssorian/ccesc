"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getTeacherById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, lastName: true, email: true, image: true } },
            institution: { select: { id: true, slug: true, user: { select: { name: true } } } },
            teacherGroups: {
                include: {
                    group: {
                        select: {
                            id: true,
                            name: true,
                            groupType: true,
                            semester: true,
                            career: { select: { id: true, name: true } },
                        },
                    },
                    course: { select: { id: true, name: true, code: true } },
                },
            },
        },
    })
    if (!teacher) return null

    return {
        ...teacher,
        institution: {
            id: teacher.institution.id,
            slug: teacher.institution.slug,
            name: teacher.institution.user.name,
        },
    }
})
