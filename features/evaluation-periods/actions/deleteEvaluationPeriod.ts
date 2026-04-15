"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteEvaluationPeriod = authAction(
    z.object({ evaluationPeriodId: z.string() }),
    async ({ evaluationPeriodId }, session) => {
        if (!session.user.role || !["ADMIN", "INSTITUTION"].includes(session.user.role)) {
            throw new Error("FORBIDDEN")
        }

        const period = await prisma.evaluationPeriod.findUnique({
            where: { id: evaluationPeriodId },
            select: { status: true },
        })
        if (!period) throw new Error("PERIOD_NOT_FOUND")
        if (period.status !== "SCHEDULED") throw new Error("PERIOD_ALREADY_USED")

        await prisma.evaluationPeriod.delete({ where: { id: evaluationPeriodId } })

        revalidatePath("/admin/periodos")
        return { success: true }
    },
)
