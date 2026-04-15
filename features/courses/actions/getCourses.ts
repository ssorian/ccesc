"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { CourseType } from "@/lib/types"

const schema = z.object({
    careerId: z.string().optional(),
    semester: z.number().int().positive().optional(),
    courseType: z.nativeEnum(CourseType).optional(),
}).default({})

export const getCourses = authAction(schema, async ({ careerId, semester, courseType }) => {
    const conditions: string[] = [`c."deletedAt" IS NULL`]
    const params: unknown[] = []
    let i = 1

    if (careerId != null) { conditions.push(`c."careerId" = $${i++}`); params.push(careerId) }
    if (semester != null) { conditions.push(`c."semester" = $${i++}`); params.push(semester) }
    if (courseType != null) { conditions.push(`c."courseType" = $${i++}`); params.push(courseType) }

    const { rows } = await db.query(`
        SELECT
            c.*,
            CASE WHEN cr.id IS NOT NULL
                THEN json_build_object('id', cr.id, 'name', cr.name, 'code', cr.code)
                ELSE NULL
            END AS career,
            (SELECT COUNT(*) FROM "Unit" u WHERE u."courseId" = c.id)::int AS unit_count,
            (SELECT COUNT(*) FROM "GroupCourse" gc WHERE gc."courseId" = c.id)::int AS group_course_count
        FROM "Course" c
        LEFT JOIN "Career" cr ON cr.id = c."careerId"
        WHERE ${conditions.join(" AND ")}
        ORDER BY c."semester" ASC NULLS LAST, c.name ASC
    `, params)

    return rows.map((r) => ({
        ...r,
        career: r.career ?? null,
        _count: { units: r.unit_count, groupCourses: r.group_course_count },
    }))
})

export type GetCoursesFilters = z.input<typeof schema>
