"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const removeStudentFromGroup = authAction(
    z.object({ groupId: z.string(), studentId: z.string() }),
    async ({ groupId, studentId }) => {
        const { rows } = await db.query(
            `DELETE FROM "StudentGroup" WHERE "studentId" = $1 AND "groupId" = $2 RETURNING *`,
            [studentId, groupId],
        )
        revalidatePath(`/admin/grupos/${groupId}`)
        return { success: true, data: rows[0] }
    },
)
