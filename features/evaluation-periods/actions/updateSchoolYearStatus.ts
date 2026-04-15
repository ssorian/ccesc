"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { SchoolYearStatus } from "@/lib/types"

const VALID_TRANSITIONS: Record<string, SchoolYearStatus> = {
    PLANNED: "ACTIVE",
    ACTIVE: "CLOSED",
}

const schema = z.object({
    id: z.string(),
    newStatus: z.nativeEnum(SchoolYearStatus),
})

export const updateSchoolYearStatus = authAction(schema, async ({ id, newStatus }) => {
    const current = await prisma.schoolYear.findUnique({ where: { id }, select: { status: true } })
    if (!current) throw new Error("SCHOOL_YEAR_NOT_FOUND")

    const allowed = VALID_TRANSITIONS[current.status]
    if (allowed !== newStatus) throw new Error("INVALID_TRANSITION")

    const schoolYear = await prisma.schoolYear.update({
        where: { id },
        data: { status: newStatus },
    })

    revalidatePath("/admin/periodos")
    return schoolYear
})
