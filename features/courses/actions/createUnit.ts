"use server"

import prisma from "@/lib/prisma"
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

    const course = await prisma.course.findUnique({ where: { id: data.courseId }, select: { id: true } })
    if (!course) throw new Error("COURSE_NOT_FOUND")

    const unit = await prisma.unit.create({
        data: {
            courseId: data.courseId,
            name: data.name,
            unitNumber: data.unitNumber,
            weight: data.weight,
            description: data.description ?? null,
        },
    })

    revalidatePath("/admin/cursos")
    return unit
})
