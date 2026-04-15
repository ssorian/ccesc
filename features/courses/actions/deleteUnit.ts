"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteUnit = authAction(z.object({ unitId: z.string() }), async ({ unitId }, session) => {
    if (session.user.role !== "ADMIN") {
        throw new Error("FORBIDDEN")
    }

    const { rows } = await db.query(
        `SELECT "lockedAt", "courseId" FROM "Unit" WHERE id = $1`,
        [unitId],
    )
    if (rows.length === 0) throw new Error("UNIT_NOT_FOUND")
    if (rows[0].lockedAt) throw new Error("UNIT_LOCKED")

    await db.query(`DELETE FROM "Unit" WHERE id = $1`, [unitId])

    revalidatePath("/admin/cursos")
    return { success: true }
})
