"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteGroup = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows } = await db.query(
        `UPDATE "Group" SET "deletedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
        [id],
    )
    revalidatePath("/admin/grupos")
    return { success: true, data: rows[0] }
})
