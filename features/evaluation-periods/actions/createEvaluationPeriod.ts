"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    schoolYearId: z.string(),
    name: z.string().min(1),
    evaluationNumber: z.number().int().min(1).max(4),
    isExtraordinary: z.boolean().default(false),
})

export const createEvaluationPeriod = authAction(schema, async (data, session) => {
    if (!session.user.role || !["ADMIN", "INSTITUTION"].includes(session.user.role)) {
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
        select: { id: true },
    })
    if (existing) throw new Error("PERIOD_ALREADY_EXISTS")

    const period = await prisma.evaluationPeriod.create({
        data: {
            schoolYearId: data.schoolYearId,
            name: data.name,
            evaluationNumber: data.evaluationNumber,
            isExtraordinary: data.isExtraordinary,
        },
    })

    revalidatePath("/admin/periodos")
    return period
})
