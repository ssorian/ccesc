"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { EvaluationPeriodStatus } from "@/lib/types"

const PERIOD_NAMES: Record<number, string> = {
    1: "Primer Corte",
    2: "Segundo Corte",
    3: "Tercer Corte",
    4: "Cuarto Corte",
}

const schema = z.object({
    schoolYearId: z.string(),
    evaluationNumber: z.number().int().min(1).max(4),
    isExtraordinary: z.boolean().default(false),
    openDate: z.string().nullable(),
    closeDate: z.string().nullable(),
    status: z.nativeEnum(EvaluationPeriodStatus),
    reason: z.string().optional(),
})

export const configurePeriod = authAction(schema, async (data, session) => {
    if (!["ADMIN", "INSTITUTION"].includes(session.user.role!)) {
        throw new Error("FORBIDDEN")
    }

    const existing = await prisma.evaluationPeriod.findUnique({
        where: {
            schoolYearId_evaluationNumber_isExtraordinary: {
                schoolYearId: data.schoolYearId,
                evaluationNumber: data.evaluationNumber,
                isExtraordinary: data.isExtraordinary,
            },
        },
        select: { id: true, status: true },
    })

    const previousStatus = existing?.status ?? null
    const newStatus = data.status

    if (previousStatus === "CLOSED" && newStatus === "OPEN") {
        if (!data.reason?.trim()) throw new Error("REASON_REQUIRED")
    }

    const name = data.isExtraordinary
        ? `Extraordinario ${data.evaluationNumber}`
        : (PERIOD_NAMES[data.evaluationNumber] ?? `Corte ${data.evaluationNumber}`)

    const result = await prisma.$transaction(async (tx) => {
        if (existing) {
            const updated = await tx.evaluationPeriod.update({
                where: { id: existing.id },
                data: {
                    status: newStatus,
                    openDate: data.openDate ? new Date(data.openDate) : null,
                    closeDate: data.closeDate ? new Date(data.closeDate) : null,
                },
            })

            if (previousStatus && previousStatus !== newStatus) {
                await tx.evaluationPeriodAuditLog.create({
                    data: {
                        evaluationPeriodId: existing.id,
                        modifiedById: session.user.id,
                        previousStatus,
                        newStatus,
                        reason: data.reason?.trim() ?? null,
                    },
                })
            }

            return updated
        }

        return tx.evaluationPeriod.create({
            data: {
                schoolYearId: data.schoolYearId,
                evaluationNumber: data.evaluationNumber,
                isExtraordinary: data.isExtraordinary,
                name,
                status: newStatus,
                openDate: data.openDate ? new Date(data.openDate) : null,
                closeDate: data.closeDate ? new Date(data.closeDate) : null,
            },
        })
    })

    revalidatePath("/admin/periodos")
    return result
})
