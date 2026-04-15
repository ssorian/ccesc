"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    id: z.string(),
    name: z.string().optional(),
    slug: z.string().optional(),
    address: z.string().nullable().optional(),
    enableGlobalEvaluation: z.boolean().optional(),
})

export const updateInstitution = authAction(schema, async ({ id, name, ...rest }) => {
    const institution = await withTransaction(async (client) => {
        if (name != null) {
            const { rows: ir } = await client.query(`SELECT "userId" FROM "Institution" WHERE id = $1`, [id])
            if (ir.length > 0) await client.query(`UPDATE "User" SET name = $1, "updatedAt" = NOW() WHERE id = $2`, [name, ir[0].userId])
        }
        const sets: string[] = [`"updatedAt" = NOW()`]; const params: unknown[] = []; let i = 1
        if (rest.slug !== undefined) { sets.push(`slug = $${i++}`); params.push(rest.slug) }
        if (rest.address !== undefined) { sets.push(`address = $${i++}`); params.push(rest.address) }
        if (rest.enableGlobalEvaluation !== undefined) { sets.push(`"enableGlobalEvaluation" = $${i++}`); params.push(rest.enableGlobalEvaluation) }
        params.push(id)
        const { rows } = await client.query(`UPDATE "Institution" SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, params)
        return rows[0]
    })
    revalidatePath("/admin/instituciones")
    revalidatePath(`/admin/instituciones/${id}`)
    return institution
})
