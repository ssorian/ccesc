"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getUnitGrades = authAction(
    z.object({ groupId: z.string(), unitId: z.string() }),
    async ({ groupId, unitId }) => {
        const studentGroups = await prisma.studentGroup.findMany({
            where: { groupId },
            include: {
                student: {
                    include: {
                        user: { select: { id: true, name: true, lastName: true } },
                        enrollments: {
                            where: { groupId },
                            select: {
                                id: true,
                                unitGrades: {
                                    where: { unitId },
                                    include: {
                                        unit: { select: { id: true, unitNumber: true, name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        return studentGroups.map((sg) => {
            const enrollment = sg.student.enrollments[0] ?? null
            const unitGrade = enrollment?.unitGrades[0] ?? null
            return {
                student: {
                    id: sg.student.id,
                    enrollmentId: sg.student.enrollmentId,
                    status: sg.student.status,
                    user: sg.student.user,
                },
                enrollment: enrollment ? { id: enrollment.id } : null,
                unitGrade: unitGrade
                    ? {
                          id: unitGrade.id,
                          grade: unitGrade.grade,
                          version: unitGrade.version,
                          gradeType: unitGrade.gradeType,
                          unitId: unitGrade.unitId,
                          unit: unitGrade.unit,
                      }
                    : null,
            }
        })
    },
)
