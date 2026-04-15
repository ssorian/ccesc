"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { validateStudentPrerequisites } from "./validateStudentPrerequisites"

export const addStudentToGroup = authAction(
    z.object({
        groupId: z.string(),
        studentId: z.string(),
        bypassPrerequisites: z.boolean().optional(),
    }),
    async ({ groupId, studentId, bypassPrerequisites = false }) => {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: {
                schoolYearId: true,
                groupCourses: {
                    include: {
                        course: {
                            include: { units: { select: { id: true, unitNumber: true } } },
                        },
                    },
                },
            },
        })

        // Prerequisite validation (skipped when bypassPrerequisites = true)
        if (!bypassPrerequisites && group && group.groupCourses.length > 0) {
            const courseIds = group.groupCourses.map((gc) => gc.courseId)
            const { blocked } = await validateStudentPrerequisites({ studentId, courseIds })
            if (blocked.length > 0) {
                throw Object.assign(new Error("PREREQUISITE_NOT_MET"), { blocked })
            }
        }

        const studentGroup = await prisma.studentGroup.create({
            data: { studentId, groupId },
        })

        if (group && group.groupCourses.length > 0) {
            await prisma.$transaction(async (tx) => {
                for (const gc of group.groupCourses) {
                    const enrollment = await tx.enrollment.upsert({
                        where: {
                            studentId_courseId_schoolYearId: {
                                studentId,
                                courseId: gc.courseId,
                                schoolYearId: group.schoolYearId,
                            },
                        },
                        create: { studentId, courseId: gc.courseId, groupId, schoolYearId: group.schoolYearId },
                        update: {},
                    })

                    await tx.unitGrade.createMany({
                        data: gc.course.units.map((unit) => ({
                            enrollmentId: enrollment.id,
                            unitId: unit.id,
                            gradeType: "ORDINARY",
                        })),
                        skipDuplicates: true,
                    })
                }
            })
        }

        revalidatePath(`/admin/grupos/${groupId}`)
        return { success: true, data: studentGroup }
    },
)
