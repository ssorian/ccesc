"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { CourseType } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createCourseSchema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    credits: z.number().positive(),
    hours: z.number().int().positive(),
    description: z.string().optional(),
    evaluationCount: z.number().int().positive().optional(),
    courseType: z.nativeEnum(CourseType).optional(),
    semester: z.number().int().positive().nullable().optional(),
    careerId: z.string().nullable().optional(),
})

export const createCourse = authAction(createCourseSchema, async (data, session) => {
    if (session.user.role !== "ADMIN") {
        throw new Error("Forbidden: only ADMIN users can create courses")
    }

    const { rows } = await db.query(
        `INSERT INTO "Course" (id, name, code, description, credits, hours, "evaluationCount", "courseType", semester, "careerId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
            crypto.randomUUID(),
            data.name,
            data.code,
            data.description ?? null,
            data.credits,
            data.hours,
            data.evaluationCount ?? 3,
            data.courseType ?? "EXCLUSIVE",
            data.semester ?? null,
            data.careerId ?? null,
        ],
    )

    revalidatePath("/admin/cursos")
    return rows[0]
})
