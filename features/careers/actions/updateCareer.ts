"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    id: z.string(),
    name: z.string().optional(),
    code: z.string().optional(),
    description: z.string().nullable().optional(),
    totalSemesters: z.number().int().positive().optional(),
})

export const updateCareer = authAction(schema, async ({ id, ...data }) => {
    const career = await prisma.career.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.code !== undefined && { code: data.code }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.totalSemesters !== undefined && { totalSemesters: data.totalSemesters }),
        },
    })
    revalidatePath("/admin/carreras")
    revalidatePath(`/admin/carreras/${id}`)
    return career
})
