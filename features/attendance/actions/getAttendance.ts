"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getAttendance = authAction(
    z.object({ groupId: z.string(), unitId: z.string(), sessionDate: z.coerce.date() }),
    async ({ groupId, unitId, sessionDate }) => {
        const dayStart = new Date(sessionDate.toDateString())
        const dayEnd = new Date(dayStart.getTime() + 86400000)

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
                                attendances: {
                                    where: {
                                        unitId,
                                        sessionDate: { gte: dayStart, lt: dayEnd },
                                    },
                                    select: { id: true, present: true, justified: true, notes: true },
                                },
                            },
                        },
                    },
                },
            },
        })

        return studentGroups.map((sg) => {
            const enrollment = sg.student.enrollments[0] ?? null
            const attendance = enrollment?.attendances[0] ?? null
            return {
                student: {
                    id: sg.student.id,
                    enrollmentId: sg.student.enrollmentId,
                    status: sg.student.status,
                    user: sg.student.user,
                },
                enrollment: enrollment ? { id: enrollment.id } : null,
                attendance: attendance
                    ? { id: attendance.id, present: attendance.present, justified: attendance.justified, notes: attendance.notes }
                    : null,
            }
        })
    },
)
