"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteApplicant = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows } = await db.query(`DELETE FROM "Applicant" WHERE id = $1 RETURNING *`, [id])
    revalidatePath("/institution/aspirantes")
    revalidatePath("/admin/aspirantes")
    return { success: true, data: rows[0] }
})
