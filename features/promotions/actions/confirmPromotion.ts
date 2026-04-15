"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { PromotionStatus } from "@/lib/types"

const schema = z.object({
    studentId: z.string(),
    schoolYearId: z.string(),
    status: z.nativeEnum(PromotionStatus),
    notes: z.string().optional(),
})

/**
 * Confirms the promotion decision for a student.
 * - PROMOTED: currentSemester++
 * - PROMOTED_WITH_DEBT: currentSemester++, failed courses remain for recursamiento
 * - RETAINED: student.status = FAILED, semester unchanged
 *
 * Also recomputes student.failedCourseCount from actual FAILED enrollment count.
 */
export const confirmPromotion = authAction(schema, async ({ studentId, schoolYearId, status, notes }) => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, currentSemester: true, career: { select: { totalSemesters: true } } },
    })
    if (!student) throw new Error("STUDENT_NOT_FOUND")

    // Count actual failed courses this school year for failedCourseCount update
    const failedEnrollmentCount = await prisma.enrollment.count({
        where: { studentId, schoolYearId, status: "FAILED" },
    })

    const result = await prisma.$transaction(async (tx) => {
        const record = await tx.promotionRecord.upsert({
            where: { studentId_schoolYearId: { studentId, schoolYearId } },
            create: {
                studentId,
                schoolYearId,
                fromSemester: student.currentSemester,
                toSemester: status !== "RETAINED" ? student.currentSemester + 1 : null,
                status,
                failedCourses: failedEnrollmentCount,
                notes: notes ?? null,
            },
            update: {
                toSemester: status !== "RETAINED" ? student.currentSemester + 1 : null,
                status,
                failedCourses: failedEnrollmentCount,
                notes: notes ?? null,
            },
        })

        const studentUpdates: Record<string, unknown> = {
            failedCourseCount: failedEnrollmentCount,
        }

        if (status === "PROMOTED" || status === "PROMOTED_WITH_DEBT") {
            const isLastSemester =
                student.career != null && student.currentSemester >= student.career.totalSemesters
            if (!isLastSemester) {
                studentUpdates.currentSemester = student.currentSemester + 1
            }
            if (status === "PROMOTED" && isLastSemester) {
                studentUpdates.status = "GRADUATED"
            }
        } else if (status === "RETAINED") {
            studentUpdates.status = "FAILED"
        }

        await tx.student.update({
            where: { id: studentId },
            data: studentUpdates,
        })

        return record
    })

    revalidatePath("/institution/alumnos")
    revalidatePath("/admin/promociones")
    return result
})
