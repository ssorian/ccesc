"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getEnrollmentRequirement = authAction(z.object({ groupId: z.string() }), async ({ groupId }) => {
    const req = await prisma.enrollmentRequirement.findUnique({
        where: { groupId },
        include: {
            group: {
                select: {
                    id: true,
                    name: true,
                    groupCourses: {
                        include: {
                            course: {
                                select: { id: true, name: true, courseType: true },
                            },
                        },
                    },
                },
            },
        },
    })
    return req ?? null
})
