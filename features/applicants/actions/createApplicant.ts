"use server"

import db from "@/lib/db"
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
    const { rows } = await db.query(
        `INSERT INTO "Applicant" (id, name, "lastName", email, curp, age, phone, state, municipality, neighborhood, street, number, "institutionCareerId", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW()) RETURNING *`,
        [crypto.randomUUID(), data.name, data.lastName, data.email, data.curp, data.age,
         data.phone ?? null, data.state, data.municipality, data.neighborhood, data.street, data.number, data.institutionCareerId],
    )
    revalidatePath("/institution/aspirantes")
    revalidatePath("/admin/aspirantes")
    return { success: true, data: rows[0] }
})
