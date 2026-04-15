"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getCourseById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows: courseRows } = await db.query(
        `SELECT c.*,
            CASE WHEN cr.id IS NOT NULL
                THEN json_build_object('id', cr.id, 'name', cr.name, 'code', cr.code)
                ELSE NULL
            END AS career
         FROM "Course" c
         LEFT JOIN "Career" cr ON cr.id = c."careerId"
         WHERE c.id = $1`,
        [id],
    )

    if (courseRows.length === 0) return null
    const course = courseRows[0]

    const [{ rows: units }, { rows: groupCourseRows }] = await Promise.all([
        db.query(
            `SELECT * FROM "Unit" WHERE "courseId" = $1 ORDER BY "unitNumber" ASC`,
            [id],
        ),
        db.query(
            `SELECT gc.id AS gc_id, gc."groupId", gc."courseId",
                g.id, g.name, g."groupType", g.semester, g."careerId", g."institutionId", g."schoolYearId", g."deletedAt", g."createdAt", g."updatedAt",
                (SELECT COUNT(*) FROM "StudentGroup" sg WHERE sg."groupId" = g.id)::int AS student_count
             FROM "GroupCourse" gc
             JOIN "Group" g ON g.id = gc."groupId"
             WHERE gc."courseId" = $1 AND g."deletedAt" IS NULL`,
            [id],
        ),
    ])

    const groupIds = groupCourseRows.map((r) => r.groupId)
    let teacherGroupsByGroup: Record<string, unknown[]> = {}
    if (groupIds.length > 0) {
        const { rows: tgRows } = await db.query(
            `SELECT tg.*, t.id AS t_id, t."employeeId", t."department", t.status,
                u.id AS u_id, u.name AS u_name, u."lastName" AS u_last_name
             FROM "TeacherGroup" tg
             JOIN "Teacher" t ON t.id = tg."teacherId"
             JOIN "User" u ON u.id = t."userId"
             WHERE tg."groupId" = ANY($1)`,
            [groupIds],
        )
        for (const tg of tgRows) {
            if (!teacherGroupsByGroup[tg.groupId]) teacherGroupsByGroup[tg.groupId] = []
            teacherGroupsByGroup[tg.groupId].push({
                ...tg,
                teacher: {
                    id: tg.t_id,
                    employeeId: tg.employeeId,
                    department: tg.department,
                    status: tg.status,
                    user: { name: tg.u_name, lastName: tg.u_last_name },
                },
            })
        }
    }

    const groupCourses = groupCourseRows.map((r) => ({
        id: r.gc_id,
        groupId: r.groupId,
        courseId: r.courseId,
        group: {
            id: r.id,
            name: r.name,
            groupType: r.groupType,
            semester: r.semester,
            careerId: r.careerId,
            institutionId: r.institutionId,
            schoolYearId: r.schoolYearId,
            deletedAt: r.deletedAt,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            _count: { studentGroups: r.student_count },
            teacherGroups: teacherGroupsByGroup[r.groupId] ?? [],
        },
    }))

    return { ...course, units, groupCourses }
})
