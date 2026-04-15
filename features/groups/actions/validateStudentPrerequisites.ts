"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

/**
 * For a student + list of courseIds, returns which courses are blocked
 * because the student hasn't passed their prerequisites.
 *
 * A prerequisite is considered passed if:
 *   - AcademicHistory record exists with passed = true, OR
 *   - Enrollment exists with status = PASSED
 */
export const validateStudentPrerequisites = authAction(
    z.object({ studentId: z.string(), courseIds: z.array(z.string()) }),
    async ({ studentId, courseIds }) => {
        if (courseIds.length === 0) return { blocked: [] }

        // Fetch all prerequisites for the given courses
        const prerequisites = await prisma.coursePrerequisite.findMany({
            where: { courseId: { in: courseIds } },
            select: {
                courseId: true,
                prerequisiteId: true,
                prerequisite: { select: { name: true, code: true } },
                course: { select: { name: true, code: true } },
            },
        })

        if (prerequisites.length === 0) return { blocked: [] }

        const prerequisiteIds = [...new Set(prerequisites.map((p) => p.prerequisiteId))]

        // Check which prerequisites the student has passed
        const [passedHistory, passedEnrollments] = await Promise.all([
            prisma.academicHistory.findMany({
                where: { studentId, courseId: { in: prerequisiteIds }, passed: true },
                select: { courseId: true },
            }),
            prisma.enrollment.findMany({
                where: { studentId, courseId: { in: prerequisiteIds }, status: "PASSED" },
                select: { courseId: true },
            }),
        ])

        const passedCourseIds = new Set([
            ...passedHistory.map((h) => h.courseId),
            ...passedEnrollments.map((e) => e.courseId),
        ])

        // Group prerequisites by courseId
        const blocked: {
            courseId: string
            courseName: string
            courseCode: string
            missingPrerequisites: { id: string; name: string; code: string }[]
        }[] = []

        const byCourse = new Map<string, typeof prerequisites>()
        for (const p of prerequisites) {
            if (!byCourse.has(p.courseId)) byCourse.set(p.courseId, [])
            byCourse.get(p.courseId)!.push(p)
        }

        for (const [courseId, prereqs] of byCourse) {
            const missing = prereqs.filter((p) => !passedCourseIds.has(p.prerequisiteId))
            if (missing.length > 0) {
                blocked.push({
                    courseId,
                    courseName: missing[0].course.name,
                    courseCode: missing[0].course.code,
                    missingPrerequisites: missing.map((p) => ({
                        id: p.prerequisiteId,
                        name: p.prerequisite.name,
                        code: p.prerequisite.code,
                    })),
                })
            }
        }

        return { blocked }
    },
)
