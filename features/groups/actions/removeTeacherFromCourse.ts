"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const removeTeacherFromCourse = authAction(
    z.object({ assignmentId: z.string(), groupId: z.string() }),
    async ({ assignmentId, groupId }) => {
        const { rows } = await db.query(
            `DELETE FROM "TeacherGroup" WHERE id = $1 RETURNING *`,
            [assignmentId],
        )
        revalidatePath(`/admin/grupos/${groupId}`)
        return { success: true, data: rows[0] }
    },
)
