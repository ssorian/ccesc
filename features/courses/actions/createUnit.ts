"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    courseId: z.string(),
    name: z.string().min(1),
    unitNumber: z.number().int().positive(),
    weight: z.number().positive().default(1.0),
    description: z.string().optional(),
})

export const createUnit = authAction(schema, async (data, session) => {
    if (session.user.role !== "ADMIN") {
        throw new Error("FORBIDDEN")
    }

    const { rows: courseRows } = await db.query(
        `SELECT id FROM "Course" WHERE id = $1`,
        [data.courseId],
    )
    if (courseRows.length === 0) throw new Error("COURSE_NOT_FOUND")

    const { rows } = await db.query(
        `INSERT INTO "Unit" (id, "courseId", name, "unitNumber", weight, description, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [
            crypto.randomUUID(),
            data.courseId,
            data.name,
            data.unitNumber,
            data.weight,
            data.description ?? null,
        ],
    )

    revalidatePath("/admin/cursos")
    return rows[0]
})
