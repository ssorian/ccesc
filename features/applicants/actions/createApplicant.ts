"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    name: z.string().min(1), lastName: z.string().min(1), email: z.string().email(),
    curp: z.string().min(1), age: z.number().int().positive(), phone: z.string().optional(),
    state: z.string().min(1), municipality: z.string().min(1), neighborhood: z.string().min(1),
    street: z.string().min(1), number: z.string().min(1), institutionCareerId: z.string().min(1),
})

export const createApplicant = authAction(schema, async (data) => {
    const applicant = await prisma.applicant.create({
        data: {
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            curp: data.curp,
            age: data.age,
            phone: data.phone ?? null,
            state: data.state,
            municipality: data.municipality,
            neighborhood: data.neighborhood,
            street: data.street,
            number: data.number,
            institutionCareerId: data.institutionCareerId,
        },
    })
    revalidatePath("/institution/aspirantes")
    revalidatePath("/admin/aspirantes")
    return { success: true, data: applicant }
})
