"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { finalizeEnrollments } from "./finalizeEnrollments"

const RETAINED_THRESHOLD = 4 // 4+ failed courses → RETAINED

/**
 * Generates a promotion report for all students in a school year.
 * Finalizes enrollment statuses first, then computes promotion suggestions.
 */
export const getPromotionReport = authAction(
    z.object({ schoolYearId: z.string(), institutionId: z.string().optional() }),
    async ({ schoolYearId, institutionId }, session) => {
        // Resolve institutionId from session if not provided
        let resolvedInstitutionId = institutionId
        if (!resolvedInstitutionId) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { institutionId: true },
            })
            if (!user?.institutionId) throw new Error("INSTITUTION_NOT_FOUND")
            resolvedInstitutionId = user.institutionId
        }

        // Finalize enrollment statuses before computing promotions
        await finalizeEnrollments({ schoolYearId })

        const students = await prisma.student.findMany({
            where: {
                institutionId: resolvedInstitutionId,
                deletedAt: null,
                enrollments: { some: { schoolYearId } },
            },
            select: {
                id: true,
                enrollmentId: true,
                currentSemester: true,
                failedCourseCount: true,
                status: true,
                user: { select: { name: true, lastName: true } },
                career: { select: { name: true, totalSemesters: true } },
                enrollments: {
                    where: { schoolYearId },
                    select: {
                        id: true,
                        status: true,
                        finalGrade: true,
                        courseId: true,
                        course: { select: { id: true, name: true, code: true, semester: true } },
                    },
                },
                promotionRecords: {
                    where: { schoolYearId },
                    select: { id: true, status: true },
                },
            },
            orderBy: [{ currentSemester: "asc" }, { user: { lastName: "asc" } }],
        })

        return students.map((student) => {
            const enrollments = student.enrollments
            const passed = enrollments.filter((e) => e.status === "PASSED")
            const failed = enrollments.filter((e) => e.status === "FAILED")
            const pending = enrollments.filter((e) => e.status === "ENROLLED")

            const failedCount = failed.length
            const isLastSemester =
                student.career != null && student.currentSemester >= student.career.totalSemesters

            let suggestedStatus: "PROMOTED" | "PROMOTED_WITH_DEBT" | "RETAINED" | "PENDING"
            if (pending.length > 0) {
                suggestedStatus = "PENDING"
            } else if (failedCount === 0) {
                suggestedStatus = isLastSemester ? "PROMOTED" : "PROMOTED"
            } else if (failedCount < RETAINED_THRESHOLD) {
                suggestedStatus = "PROMOTED_WITH_DEBT"
            } else {
                suggestedStatus = "RETAINED"
            }

            const existingRecord = student.promotionRecords[0] ?? null

            return {
                studentId: student.id,
                enrollmentCode: student.enrollmentId,
                name: `${student.user.name} ${student.user.lastName ?? ""}`.trim(),
                currentSemester: student.currentSemester,
                career: student.career?.name ?? null,
                passedCourses: passed.map((e) => ({
                    courseId: e.courseId,
                    name: e.course.name,
                    code: e.course.code,
                    finalGrade: e.finalGrade,
                })),
                failedCourses: failed.map((e) => ({
                    courseId: e.courseId,
                    name: e.course.name,
                    code: e.course.code,
                    finalGrade: e.finalGrade,
                })),
                pendingCourses: pending.map((e) => ({
                    courseId: e.courseId,
                    name: e.course.name,
                    code: e.course.code,
                })),
                suggestedStatus,
                confirmedStatus: existingRecord?.status ?? null,
                promotionRecordId: existingRecord?.id ?? null,
            }
        })
    },
)

export type PromotionReportEntry = Awaited<ReturnType<typeof getPromotionReport>>[number]
