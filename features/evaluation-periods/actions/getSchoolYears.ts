"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getSchoolYears = authAction(
    z.object({}).default({}),
    async () => {
        const schoolYears = await prisma.schoolYear.findMany({
            select: { id: true, name: true, status: true },
            orderBy: { startDate: "desc" },
        })
        return schoolYears
    },
)
