"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    unitId: z.string(),
    name: z.string().min(1).optional(),
    weight: z.number().positive().optional(),
    description: z.string().optional().nullable(),
})

export const updateUnit = authAction(schema, async ({ unitId, name, weight, description }, session) => {
    if (session.user.role !== "ADMIN") {
        throw new Error("FORBIDDEN")
    }

    const { rows: existing } = await db.query(
        `SELECT "lockedAt" FROM "Unit" WHERE id = $1`,
        [unitId],
    )
    if (existing.length === 0) throw new Error("UNIT_NOT_FOUND")
    if (existing[0].lockedAt && weight !== undefined) throw new Error("UNIT_LOCKED")

    const sets: string[] = [`"updatedAt" = NOW()`]
    const params: unknown[] = []
    let i = 1

    if (name !== undefined) { sets.push(`name = $${i++}`); params.push(name) }
    if (weight !== undefined) { sets.push(`weight = $${i++}`); params.push(weight) }
    if (description !== undefined) { sets.push(`description = $${i++}`); params.push(description) }

    params.push(unitId)
    const { rows } = await db.query(
        `UPDATE "Unit" SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
        params,
    )

    revalidatePath("/admin/cursos")
    return rows[0]
})
