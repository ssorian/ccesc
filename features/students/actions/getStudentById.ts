"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getStudentById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const student = await prisma.student.findFirst({
        where: { id },
        include: {
            user: { select: { id: true, name: true, lastName: true, email: true, image: true } },
            career: { select: { id: true, name: true, code: true, totalSemesters: true } },
            institution: { select: { id: true, slug: true, user: { select: { name: true } } } },
            enrollments: {
                include: {
                    course: { select: { id: true, name: true, code: true, credits: true } },
                    unitGrades: {
                        include: {
                            unit: { select: { id: true, unitNumber: true, name: true } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            academicHistory: {
                include: { course: { select: { id: true, name: true, code: true } } },
                orderBy: [{ schoolYearName: "desc" }, { semester: "asc" }],
            },
        },
    })
    if (!student) return null

    return {
        ...student,
        institution: {
            id: student.institution.id,
            slug: student.institution.slug,
            name: student.institution.user.name,
        },
    }
})
