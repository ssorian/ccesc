"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    name: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
})

export const createSchoolYear = authAction(schema, async ({ name, startDate, endDate }) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) throw new Error("END_BEFORE_START")

    const schoolYear = await prisma.schoolYear.create({
        data: { name, startDate: start, endDate: end, status: "PLANNED" },
    })

    revalidatePath("/admin/periodos")
    return schoolYear
})
