"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    id: z.string(),
    name: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
})

export const updateSchoolYear = authAction(schema, async ({ id, name, startDate, endDate }) => {
    const current = await prisma.schoolYear.findUnique({ where: { id }, select: { status: true } })
    if (!current) throw new Error("SCHOOL_YEAR_NOT_FOUND")
    if (current.status !== "PLANNED") throw new Error("SCHOOL_YEAR_NOT_EDITABLE")

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) throw new Error("END_BEFORE_START")

    const schoolYear = await prisma.schoolYear.update({
        where: { id },
        data: { name, startDate: start, endDate: end },
    })

    revalidatePath("/admin/periodos")
    return schoolYear
})
