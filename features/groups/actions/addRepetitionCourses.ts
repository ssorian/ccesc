"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

/**
 * Adds failed courses from a previous school year to a student's new group (recursamiento).
 * Creates Enrollments + ORDINARY UnitGrades for each course.
 *
 * Used after confirmPromotion(PROMOTED_WITH_DEBT) to set up the courses the student must retake.
 */
export const addRepetitionCourses = authAction(
    z.object({
        studentId: z.string(),
        groupId: z.string(),
        courseIds: z.array(z.string()).min(1),
    }),
    async ({ studentId, groupId, courseIds }) => {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { schoolYearId: true },
        })
        if (!group) throw new Error("GROUP_NOT_FOUND")

        const courses = await prisma.course.findMany({
            where: { id: { in: courseIds } },
            select: {
                id: true,
                units: { select: { id: true } },
            },
        })
        if (courses.length === 0) throw new Error("COURSES_NOT_FOUND")

        const enrollments = await prisma.$transaction(async (tx) => {
            const created: string[] = []

            for (const course of courses) {
                const enrollment = await tx.enrollment.upsert({
                    where: {
                        studentId_courseId_schoolYearId: {
                            studentId,
                            courseId: course.id,
                            schoolYearId: group.schoolYearId,
                        },
                    },
                    create: {
                        studentId,
                        courseId: course.id,
                        groupId,
                        schoolYearId: group.schoolYearId,
                        status: "ENROLLED",
                    },
                    update: {
                        // If enrollment already exists (edge case), update groupId
                        groupId,
                        status: "ENROLLED",
                    },
                })

                await tx.unitGrade.createMany({
                    data: course.units.map((unit) => ({
                        enrollmentId: enrollment.id,
                        unitId: unit.id,
                        gradeType: "ORDINARY" as const,
                    })),
                    skipDuplicates: true,
                })

                created.push(enrollment.id)
            }

            return created
        })

        revalidatePath(`/admin/grupos/${groupId}`)
        revalidatePath("/institution/alumnos")
        return { enrollmentIds: enrollments, courseCount: courses.length }
    },
)
