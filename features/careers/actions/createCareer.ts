"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    description: z.string().optional(),
    totalSemesters: z.number().int().positive().optional(),
})

export const createCareer = authAction(schema, async (data, session) => {
    if (session.user.role !== "ADMIN") throw new Error("Forbidden: only ADMIN users can create careers")
    const career = await prisma.career.create({
        data: {
            name: data.name,
            code: data.code,
            description: data.description ?? null,
            totalSemesters: data.totalSemesters ?? 8,
        },
    })
    revalidatePath("/admin/carreras")
    return career
})
