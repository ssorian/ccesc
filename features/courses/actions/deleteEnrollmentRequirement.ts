"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteEnrollmentRequirement = authAction(z.object({ groupId: z.string() }), async ({ groupId }) => {
    const { rows } = await db.query(
        `DELETE FROM "EnrollmentRequirement" WHERE "groupId" = $1 RETURNING *`,
        [groupId],
    )
    revalidatePath("/admin/cursos")
    return rows[0]
})
