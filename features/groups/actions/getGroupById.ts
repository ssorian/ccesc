"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getGroupById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            career: { select: { id: true, name: true } },
            institution: { select: { id: true, slug: true, user: { select: { name: true } } } },
            schoolYear: { select: { id: true, name: true } },
            groupCourses: {
                include: {
                    course: {
                        include: {
                            units: { orderBy: { unitNumber: "asc" } },
                        },
                    },
                },
            },
            teacherGroups: {
                include: {
                    teacher: {
                        include: {
                            user: { select: { id: true, name: true, lastName: true, email: true } },
                        },
                    },
                    course: { select: { id: true, name: true, code: true } },
                },
            },
            studentGroups: {
                include: {
                    student: {
                        include: {
                            user: { select: { id: true, name: true, lastName: true, email: true } },
                            enrollments: {
                                where: { groupId: id },
                                include: {
                                    unitGrades: {
                                        include: {
                                            unit: { select: { id: true, unitNumber: true, name: true } },
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
    if (!group) return null

    return {
        ...group,
        institution: {
            id: group.institution.id,
            slug: group.institution.slug,
            name: group.institution.user.name,
        },
    }
})
