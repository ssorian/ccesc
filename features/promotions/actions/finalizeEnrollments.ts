"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { PASS_THRESHOLD } from "@/features/grades/actions/updateUnitGrade"

/**
 * Finalizes enrollment statuses for a school year.
 * Sets PASSED/FAILED on all ENROLLED enrollments that have a finalGrade.
 * Must be called before generating the promotion report.
 */
export const finalizeEnrollments = authAction(
    z.object({ schoolYearId: z.string() }),
    async ({ schoolYearId }) => {
        const enrollments = await prisma.enrollment.findMany({
            where: { schoolYearId, status: "ENROLLED", finalGrade: { not: null } },
            select: { id: true, finalGrade: true },
        })

        const passed = enrollments.filter((e) => e.finalGrade! >= PASS_THRESHOLD).map((e) => e.id)
        const failed = enrollments.filter((e) => e.finalGrade! < PASS_THRESHOLD).map((e) => e.id)

        await prisma.$transaction([
            prisma.enrollment.updateMany({
                where: { id: { in: passed } },
                data: { status: "PASSED" },
            }),
            prisma.enrollment.updateMany({
                where: { id: { in: failed } },
                data: { status: "FAILED" },
            }),
        ])

        return { passedCount: passed.length, failedCount: failed.length }
    },
)
