"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const assignTeacherToCourse = authAction(
    z.object({ groupId: z.string(), courseId: z.string(), teacherId: z.string() }),
    async ({ groupId, courseId, teacherId }) => {
        const { rows } = await db.query(
            `INSERT INTO "TeacherGroup" (id, "groupId", "courseId", "teacherId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [crypto.randomUUID(), groupId, courseId, teacherId],
        )
        revalidatePath(`/admin/grupos/${groupId}`)
        return { success: true, data: rows[0] }
    },
)
