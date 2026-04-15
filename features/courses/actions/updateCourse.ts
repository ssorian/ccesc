"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { CourseType } from "@/lib/types"

const schema = z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    credits: z.number().positive().optional(),
    hours: z.number().int().positive().optional(),
    evaluationCount: z.number().int().positive().optional(),
    courseType: z.nativeEnum(CourseType).optional(),
    semester: z.number().int().positive().nullable().optional(),
    careerId: z.string().nullable().optional(),
})

export const updateCourse = authAction(schema, async ({ id, ...data }) => {
    const sets: string[] = [`"updatedAt" = NOW()`]
    const params: unknown[] = []
    let i = 1

    if (data.name !== undefined) { sets.push(`name = $${i++}`); params.push(data.name) }
    if (data.description !== undefined) { sets.push(`description = $${i++}`); params.push(data.description) }
    if (data.credits !== undefined) { sets.push(`credits = $${i++}`); params.push(data.credits) }
    if (data.hours !== undefined) { sets.push(`hours = $${i++}`); params.push(data.hours) }
    if (data.evaluationCount !== undefined) { sets.push(`"evaluationCount" = $${i++}`); params.push(data.evaluationCount) }
    if (data.courseType !== undefined) { sets.push(`"courseType" = $${i++}`); params.push(data.courseType) }
    if (data.semester !== undefined) { sets.push(`semester = $${i++}`); params.push(data.semester) }
    if (data.careerId !== undefined) { sets.push(`"careerId" = $${i++}`); params.push(data.careerId) }

    params.push(id)
    const { rows } = await db.query(
        `UPDATE "Course" SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
        params,
    )

    revalidatePath("/admin/cursos")
    revalidatePath(`/admin/cursos/${id}`)
    return rows[0]
})
