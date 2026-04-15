"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { EvaluationPeriodStatus } from "@/lib/types"

const schema = z.object({
    evaluationPeriodId: z.string(),
    newStatus: z.nativeEnum(EvaluationPeriodStatus),
    reason: z.string().optional(),
})

export const updateEvaluationPeriodStatus = authAction(schema, async (
    { evaluationPeriodId, newStatus, reason },
    session
) => {
    const period = await prisma.evaluationPeriod.findUnique({
        where: { id: evaluationPeriodId },
        select: { status: true },
    })
    if (!period) throw new Error("PERIOD_NOT_FOUND")

    const previousStatus = period.status

    if (previousStatus === "CLOSED" && newStatus === "OPEN") {
        if (!reason || reason.trim() === "") throw new Error("REASON_REQUIRED")
    }

    const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.evaluationPeriod.update({
            where: { id: evaluationPeriodId },
            data: {
                status: newStatus,
                ...(newStatus === "OPEN" && { openDate: new Date() }),
                ...(newStatus === "CLOSED" && { closeDate: new Date() }),
            },
        })

        await tx.evaluationPeriodAuditLog.create({
            data: {
                evaluationPeriodId,
                modifiedById: session.user.id,
                previousStatus,
                newStatus,
                reason: reason?.trim() ?? null,
            },
        })

        return updated
    })

    revalidatePath("/admin/periodos")
    return result
})
