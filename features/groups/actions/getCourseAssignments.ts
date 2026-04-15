"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getCourseAssignments = authAction(z.object({ groupId: z.string() }), async ({ groupId }) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { groupType: true, careerId: true, semester: true },
    })
    if (!group) return { success: true, data: [] }

    const assignments = await prisma.teacherGroup.findMany({
        where: { groupId },
        include: {
            teacher: {
                include: {
                    user: { select: { id: true, name: true, lastName: true, email: true } },
                },
            },
        },
    })

    const buildTeacher = (a: (typeof assignments)[number]) => ({
        id: a.teacher.id,
        employeeId: a.teacher.employeeId,
        department: a.teacher.department,
        status: a.teacher.status,
        user: { id: a.teacher.user.id, name: a.teacher.user.name, lastName: a.teacher.user.lastName, email: a.teacher.user.email },
    })

    if (group.groupType === "CAREER_SEMESTER" && group.careerId && group.semester) {
        const courses = await prisma.course.findMany({
            where: { careerId: group.careerId, semester: group.semester, deletedAt: null },
        })
        return {
            success: true,
            data: courses.map((course) => {
                const assignment = assignments.find((a) => a.courseId === course.id)
                return {
                    id: assignment?.id ?? course.id,
                    assignmentId: assignment?.id ?? null,
                    course,
                    teacher: assignment ? buildTeacher(assignment) : undefined,
                }
            }),
        }
    }

    const courseIds = [...new Set(assignments.map((a) => a.courseId).filter(Boolean))] as string[]
    const courses = courseIds.length > 0
        ? await prisma.course.findMany({ where: { id: { in: courseIds } } })
        : []
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]))

    return {
        success: true,
        data: assignments.map((a) => ({
            id: a.id,
            assignmentId: a.id,
            course: a.courseId ? courseMap[a.courseId] ?? null : null,
            teacher: buildTeacher(a),
        })),
    }
})
