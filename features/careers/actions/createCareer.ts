"use server"

import db from "@/lib/db"
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
    const { rows } = await db.query(
        `INSERT INTO "Career" (id, name, code, description, "totalSemesters", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [crypto.randomUUID(), data.name, data.code, data.description ?? null, data.totalSemesters ?? 8],
    )
    revalidatePath("/admin/carreras")
    return rows[0]
})
