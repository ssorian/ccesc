"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    name: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    employeeId: z.string().min(1),
    department: z.string().min(1),
    institutionId: z.string().min(1),
})

export const createTeacher = authAction(schema, async (data) => {
    const teacher = await withTransaction(async (client) => {
        const userId = crypto.randomUUID()
        await client.query(
            `INSERT INTO "User" (id, name, "lastName", email, "emailVerified", role, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, false, 'TEACHER', NOW(), NOW())`,
            [userId, data.name, data.lastName, data.email],
        )
        const { rows } = await client.query(
            `INSERT INTO "Teacher" (id, "employeeId", department, "institutionId", "userId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
            [crypto.randomUUID(), data.employeeId, data.department, data.institutionId, userId],
        )
        return rows[0]
    })
    revalidatePath("/admin/profesores")
    return teacher
})
