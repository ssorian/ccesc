"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getGroupAuditLogs = authAction(
    z.object({ groupId: z.string() }),
    async ({ groupId }) => {
        const logs = await prisma.unitGradeAuditLog.findMany({
            where: {
                unitGrade: { enrollment: { groupId } },
            },
            include: {
                unitGrade: {
                    include: {
                        unit: { select: { id: true, unitNumber: true, name: true } },
                        enrollment: {
                            include: {
                                student: {
                                    include: {
                                        user: { select: { id: true, name: true, lastName: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return logs.map((al) => ({
            id: al.id,
            unitGradeId: al.unitGradeId,
            oldGrade: al.oldGrade,
            newGrade: al.newGrade,
            userId: al.userId,
            reason: al.reason,
            createdAt: al.createdAt,
            unitGrade: {
                id: al.unitGrade.id,
                enrollmentId: al.unitGrade.enrollmentId,
                unitId: al.unitGrade.unitId,
                gradeType: al.unitGrade.gradeType,
                unit: al.unitGrade.unit,
                enrollment: {
                    student: {
                        id: al.unitGrade.enrollment.student.id,
                        user: al.unitGrade.enrollment.student.user,
                    },
                },
            },
        }))
    },
)
