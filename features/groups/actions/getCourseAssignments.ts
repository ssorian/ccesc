"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getCourseAssignments = authAction(z.object({ groupId: z.string() }), async ({ groupId }) => {
    const { rows: groupRows } = await db.query(
        `SELECT "groupType", "careerId", semester FROM "Group" WHERE id = $1`,
        [groupId],
    )
    if (groupRows.length === 0) return { success: true, data: [] }
    const group = groupRows[0]

    const { rows: assignRows } = await db.query(
        `SELECT tg.id, tg."courseId", tg."teacherId",
            t.id AS t_id, t."employeeId", t.department, t.status AS t_status,
            tu.id AS tu_id, tu.name AS tu_name, tu."lastName" AS tu_last_name, tu.email AS tu_email
         FROM "TeacherGroup" tg
         JOIN "Teacher" t ON t.id = tg."teacherId"
         JOIN "User" tu ON tu.id = t."userId"
         WHERE tg."groupId" = $1`,
        [groupId],
    )

    const buildTeacher = (r: Record<string, unknown>) => ({
        id: r.t_id,
        employeeId: r.employeeId,
        department: r.department,
        status: r.t_status,
        user: { id: r.tu_id, name: r.tu_name, lastName: r.tu_last_name, email: r.tu_email },
    })

    if (group.groupType === "CAREER_SEMESTER" && group.careerId && group.semester) {
        const { rows: courseRows } = await db.query(
            `SELECT * FROM "Course" WHERE "careerId" = $1 AND semester = $2 AND "deletedAt" IS NULL`,
            [group.careerId, group.semester],
        )
        return {
            success: true,
            data: courseRows.map((course) => {
                const assignment = assignRows.find((a) => a.courseId === course.id)
                return {
                    id: assignment?.id ?? course.id,
                    assignmentId: assignment?.id ?? null,
                    course,
                    teacher: assignment ? buildTeacher(assignment) : undefined,
                }
            }),
        }
    }

    const courseIds = [...new Set(assignRows.map((r) => r.courseId).filter(Boolean))]
    let courseMap: Record<string, unknown> = {}
    if (courseIds.length > 0) {
        const { rows: cRows } = await db.query(
            `SELECT * FROM "Course" WHERE id = ANY($1)`,
            [courseIds],
        )
        for (const c of cRows) courseMap[c.id] = c
    }

    return {
        success: true,
        data: assignRows.map((r) => ({
            id: r.id,
            assignmentId: r.id,
            course: courseMap[r.courseId as string] ?? null,
            teacher: buildTeacher(r),
        })),
    }
})
