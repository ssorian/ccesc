"use server"

import db from "@/lib/db"
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
    const sets: string[] = [`"updatedAt" = NOW()`]
    const params: unknown[] = []
    let i = 1
    if (data.name !== undefined) { sets.push(`name = $${i++}`); params.push(data.name) }
    if (data.code !== undefined) { sets.push(`code = $${i++}`); params.push(data.code) }
    if (data.description !== undefined) { sets.push(`description = $${i++}`); params.push(data.description) }
    if (data.totalSemesters !== undefined) { sets.push(`"totalSemesters" = $${i++}`); params.push(data.totalSemesters) }
    params.push(id)
    const { rows } = await db.query(`UPDATE "Career" SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, params)
    revalidatePath("/admin/carreras")
    revalidatePath(`/admin/carreras/${id}`)
    return rows[0]
})
