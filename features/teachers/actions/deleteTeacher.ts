"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteTeacher = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows } = await db.query(
        `UPDATE "Teacher" SET "deletedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
        [id],
    )
    revalidatePath("/admin/profesores")
    return rows[0]
})
