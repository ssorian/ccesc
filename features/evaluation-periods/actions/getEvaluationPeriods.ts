"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getEvaluationPeriods = authAction(
    z.object({ schoolYearId: z.string().optional() }).default({}),
    async ({ schoolYearId }) => {
        const periods = await prisma.evaluationPeriod.findMany({
            where: schoolYearId != null ? { schoolYearId } : undefined,
            include: {
                schoolYear: { select: { id: true, name: true } },
            },
            orderBy: [{ schoolYear: { name: "desc" } }, { evaluationNumber: "asc" }],
        })
        return periods
    },
)
