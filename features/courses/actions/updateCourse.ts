"use server"

import prisma from "@/lib/prisma"
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
    const course = await prisma.course.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.credits !== undefined && { credits: data.credits }),
            ...(data.hours !== undefined && { hours: data.hours }),
            ...(data.evaluationCount !== undefined && { evaluationCount: data.evaluationCount }),
            ...(data.courseType !== undefined && { courseType: data.courseType }),
            ...(data.semester !== undefined && { semester: data.semester }),
            ...(data.careerId !== undefined && { careerId: data.careerId }),
        },
    })

    revalidatePath("/admin/cursos")
    revalidatePath(`/admin/cursos/${id}`)
    return course
})
