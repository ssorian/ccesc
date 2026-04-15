"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const addStudentToGroup = authAction(
    z.object({ groupId: z.string(), studentId: z.string() }),
    async ({ groupId, studentId }) => {
        const { rows: sgRows } = await db.query(
            `INSERT INTO "StudentGroup" (id, "studentId", "groupId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, NOW(), NOW())
             RETURNING *`,
            [crypto.randomUUID(), studentId, groupId],
        )
        const studentGroup = sgRows[0]

        const { rows: groupRows } = await db.query(
            `SELECT g."schoolYearId",
                json_agg(json_build_object(
                    'courseId', gc."courseId",
                    'units', (
                        SELECT json_agg(json_build_object('id', u.id, 'unitNumber', u."unitNumber") ORDER BY u."unitNumber")
                        FROM "Unit" u WHERE u."courseId" = gc."courseId"
                    )
                )) AS "groupCourses"
             FROM "Group" g
             JOIN "GroupCourse" gc ON gc."groupId" = g.id
             WHERE g.id = $1
             GROUP BY g."schoolYearId"`,
            [groupId],
        )

        if (groupRows.length > 0) {
            const { schoolYearId, groupCourses } = groupRows[0]

            await withTransaction(async (client) => {
                // Upsert enrollments for each course
                const enrollmentIds: { courseId: string; enrollmentId: string }[] = []

                for (const gc of groupCourses) {
                    const { rows: enRows } = await client.query(
                        `INSERT INTO "Enrollment" (id, "studentId", "courseId", "groupId", "schoolYearId", "createdAt", "updatedAt")
                         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                         ON CONFLICT ("studentId", "courseId", "schoolYearId") DO UPDATE SET "updatedAt" = "Enrollment"."updatedAt"
                         RETURNING id, "courseId"`,
                        [crypto.randomUUID(), studentId, gc.courseId, groupId, schoolYearId],
                    )
                    enrollmentIds.push({ courseId: gc.courseId, enrollmentId: enRows[0].id })

                    // Seed UnitGrades
                    const units = gc.units ?? []
                    for (const unit of units) {
                        await client.query(
                            `INSERT INTO "UnitGrade" (id, "enrollmentId", "unitId", "gradeType", version, "createdAt", "updatedAt")
                             VALUES ($1, $2, $3, 'ORDINARY', 0, NOW(), NOW())
                             ON CONFLICT ("enrollmentId", "unitId", "gradeType") DO NOTHING`,
                            [crypto.randomUUID(), enRows[0].id, unit.id],
                        )
                    }
                }
            })
        }

        revalidatePath(`/admin/grupos/${groupId}`)
        return { success: true, data: studentGroup }
    },
)
