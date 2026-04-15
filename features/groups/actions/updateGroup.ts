"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { GroupType } from "@/lib/types"

const schema = z.object({
    id: z.string(),
    name: z.string().optional(),
    semester: z.number().int().positive().nullable().optional(),
    groupType: z.nativeEnum(GroupType).optional(),
})

export const updateGroup = authAction(schema, async ({ id, ...data }) => {
    const sets: string[] = [`"updatedAt" = NOW()`]
    const params: unknown[] = []
    let i = 1

    if (data.name !== undefined) { sets.push(`name = $${i++}`); params.push(data.name) }
    if (data.semester !== undefined) { sets.push(`semester = $${i++}`); params.push(data.semester) }
    if (data.groupType !== undefined) { sets.push(`"groupType" = $${i++}`); params.push(data.groupType) }

    params.push(id)
    const { rows } = await db.query(
        `UPDATE "Group" SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
        params,
    )

    revalidatePath("/admin/grupos")
    revalidatePath(`/admin/grupos/${id}`)
    return { success: true, data: rows[0] }
})
