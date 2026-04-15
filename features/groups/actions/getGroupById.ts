"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getGroupById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows: groupRows } = await db.query(
        `SELECT g.*,
            CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name) ELSE NULL END AS career,
            json_build_object('id', inst.id, 'slug', inst.slug, 'name', u.name) AS institution,
            json_build_object('id', sy.id, 'name', sy.name) AS "schoolYear"
         FROM "Group" g
         LEFT JOIN "Career" c ON c.id = g."careerId"
         JOIN "Institution" inst ON inst.id = g."institutionId"
         JOIN "User" u ON u.id = inst."userId"
         JOIN "SchoolYear" sy ON sy.id = g."schoolYearId"
         WHERE g.id = $1`,
        [id],
    )
    if (groupRows.length === 0) return null
    const group = groupRows[0]

    const [
        { rows: gcRows },
        { rows: tgRows },
        { rows: sgRows },
    ] = await Promise.all([
        db.query(
            `SELECT gc.id AS gc_id, gc."groupId", gc."courseId",
                c.*,
                (SELECT json_agg(un.* ORDER BY un."unitNumber") FROM "Unit" un WHERE un."courseId" = c.id) AS units
             FROM "GroupCourse" gc
             JOIN "Course" c ON c.id = gc."courseId"
             WHERE gc."groupId" = $1`,
            [id],
        ),
        db.query(
            `SELECT tg.*,
                t.id AS t_id, t."employeeId", t.department, t.status AS t_status,
                tu.id AS tu_id, tu.name AS tu_name, tu."lastName" AS tu_last_name, tu.email AS tu_email,
                c.id AS c_id, c.name AS c_name, c.code AS c_code
             FROM "TeacherGroup" tg
             JOIN "Teacher" t ON t.id = tg."teacherId"
             JOIN "User" tu ON tu.id = t."userId"
             LEFT JOIN "Course" c ON c.id = tg."courseId"
             WHERE tg."groupId" = $1`,
            [id],
        ),
        db.query(
            `SELECT sg.id AS sg_id, sg."studentId", sg."groupId",
                s.id AS s_id, s."enrollmentId", s.status AS s_status,
                su.id AS su_id, su.name AS su_name, su."lastName" AS su_last_name, su.email AS su_email
             FROM "StudentGroup" sg
             JOIN "Student" s ON s.id = sg."studentId"
             JOIN "User" su ON su.id = s."userId"
             WHERE sg."groupId" = $1`,
            [id],
        ),
    ])

    // Fetch enrollments + unitGrades for each student in this group
    const studentIds = sgRows.map((r) => r.studentId)
    let enrollmentsByStudent: Record<string, unknown[]> = {}
    if (studentIds.length > 0) {
        const { rows: enrollRows } = await db.query(
            `SELECT e.*, ug.id AS ug_id, ug."unitId", ug.grade, ug.version, ug."gradeType",
                un.id AS un_id, un."unitNumber", un.name AS un_name
             FROM "Enrollment" e
             LEFT JOIN "UnitGrade" ug ON ug."enrollmentId" = e.id
             LEFT JOIN "Unit" un ON un.id = ug."unitId"
             WHERE e."studentId" = ANY($1) AND e."groupId" = $2`,
            [studentIds, id],
        )

        const enrollMap: Record<string, { enrollment: Record<string, unknown>; grades: unknown[] }> = {}
        for (const r of enrollRows) {
            if (!enrollMap[r.studentId]) {
                enrollMap[r.studentId] = {
                    enrollment: {
                        id: r.id, studentId: r.studentId, courseId: r.courseId,
                        groupId: r.groupId, schoolYearId: r.schoolYearId,
                        status: r.status, finalGrade: r.finalGrade, unitsAverage: r.unitsAverage,
                    },
                    grades: [],
                }
            }
            if (r.ug_id) {
                enrollMap[r.studentId].grades.push({
                    id: r.ug_id, unitId: r.unitId, grade: r.grade, version: r.version, gradeType: r.gradeType,
                    unit: { id: r.un_id, unitNumber: r.unitNumber, name: r.un_name },
                })
            }
        }

        for (const [sid, data] of Object.entries(enrollMap)) {
            if (!enrollmentsByStudent[sid]) enrollmentsByStudent[sid] = []
            enrollmentsByStudent[sid].push({ ...data.enrollment, unitGrades: data.grades })
        }
    }

    return {
        ...group,
        groupCourses: gcRows.map((r) => ({
            id: r.gc_id,
            groupId: r.groupId,
            courseId: r.courseId,
            course: {
                id: r.id, name: r.name, code: r.code, description: r.description,
                credits: r.credits, hours: r.hours, courseType: r.courseType,
                units: r.units ?? [],
            },
        })),
        teacherGroups: tgRows.map((r) => ({
            id: r.id, groupId: r.groupId, courseId: r.courseId, role: r.role,
            teacher: {
                id: r.t_id, employeeId: r.employeeId, department: r.department, status: r.t_status,
                user: { id: r.tu_id, name: r.tu_name, lastName: r.tu_last_name, email: r.tu_email },
            },
            course: r.c_id ? { id: r.c_id, name: r.c_name, code: r.c_code } : null,
        })),
        studentGroups: sgRows.map((r) => ({
            id: r.sg_id,
            studentId: r.studentId,
            groupId: r.groupId,
            student: {
                id: r.s_id, enrollmentId: r.enrollmentId, status: r.s_status,
                user: { id: r.su_id, name: r.su_name, lastName: r.su_last_name, email: r.su_email },
                enrollments: enrollmentsByStudent[r.studentId] ?? [],
            },
        })),
    }
})
