"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getStudentById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows } = await db.query(
        `SELECT s.*,
            json_build_object('id', u.id, 'name', u.name, 'lastName', u."lastName", 'email', u.email, 'image', u.image) AS "user",
            CASE WHEN c.id IS NOT NULL
                THEN json_build_object('id', c.id, 'name', c.name, 'code', c.code, 'totalSemesters', c."totalSemesters")
                ELSE NULL END AS career,
            json_build_object('id', inst.id, 'slug', inst.slug, 'name', iu.name) AS institution
         FROM "Student" s
         JOIN "User" u ON u.id = s."userId"
         LEFT JOIN "Career" c ON c.id = s."careerId"
         JOIN "Institution" inst ON inst.id = s."institutionId"
         JOIN "User" iu ON iu.id = inst."userId"
         WHERE s.id = $1`,
        [id],
    )
    if (rows.length === 0) return null
    const student = rows[0]

    const [{ rows: enrollRows }, { rows: histRows }] = await Promise.all([
        db.query(
            `SELECT e.*,
                json_build_object('id', c.id, 'name', c.name, 'code', c.code, 'credits', c.credits) AS course,
                COALESCE(json_agg(
                    CASE WHEN ug.id IS NOT NULL THEN
                        json_build_object('id', ug.id, 'grade', ug.grade, 'gradeType', ug."gradeType",
                            'unit', json_build_object('id', un.id, 'unitNumber', un."unitNumber", 'name', un.name))
                    ELSE NULL END
                ) FILTER (WHERE ug.id IS NOT NULL), '[]') AS "unitGrades"
             FROM "Enrollment" e
             JOIN "Course" c ON c.id = e."courseId"
             LEFT JOIN "UnitGrade" ug ON ug."enrollmentId" = e.id
             LEFT JOIN "Unit" un ON un.id = ug."unitId"
             WHERE e."studentId" = $1
             GROUP BY e.id, c.id
             ORDER BY e."createdAt" DESC`,
            [id],
        ),
        db.query(
            `SELECT ah.*, json_build_object('id', c.id, 'name', c.name, 'code', c.code) AS course
             FROM "AcademicHistory" ah
             JOIN "Course" c ON c.id = ah."courseId"
             WHERE ah."studentId" = $1
             ORDER BY ah."schoolYearName" DESC, ah.semester ASC`,
            [id],
        ),
    ])

    return { ...student, enrollments: enrollRows, academicHistory: histRows }
})
