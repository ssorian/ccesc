"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getCourseById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            career: { select: { id: true, name: true, code: true } },
            units: { orderBy: { unitNumber: "asc" } },
            groupCourses: {
                where: { group: { deletedAt: null } },
                include: {
                    group: {
                        include: {
                            _count: { select: { studentGroups: true } },
                            teacherGroups: {
                                include: {
                                    teacher: {
                                        include: {
                                            user: { select: { name: true, lastName: true } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    if (!course) return null
    return course
})
