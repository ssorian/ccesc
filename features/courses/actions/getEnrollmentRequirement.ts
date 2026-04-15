"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getEnrollmentRequirement = authAction(z.object({ groupId: z.string() }), async ({ groupId }) => {
    const { rows } = await db.query(
        `SELECT er.*,
            json_build_object(
                'id', g.id,
                'name', g.name,
                'groupCourses', (
                    SELECT json_agg(
                        json_build_object(
                            'id', gc.id,
                            'course', json_build_object(
                                'id', c.id,
                                'name', c.name,
                                'courseType', c."courseType"
                            )
                        )
                    )
                    FROM "GroupCourse" gc
                    JOIN "Course" c ON c.id = gc."courseId"
                    WHERE gc."groupId" = g.id
                )
            ) AS "group"
         FROM "EnrollmentRequirement" er
         JOIN "Group" g ON g.id = er."groupId"
         WHERE er."groupId" = $1`,
        [groupId],
    )
    return rows[0] ?? null
})
