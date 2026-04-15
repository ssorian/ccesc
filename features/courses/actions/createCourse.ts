"use server"

import prisma from "@/lib/prisma"
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

    const course = await prisma.course.create({
        data: {
            name: data.name,
            code: data.code,
            description: data.description ?? null,
            credits: data.credits,
            hours: data.hours,
            evaluationCount: data.evaluationCount ?? 3,
            courseType: data.courseType ?? "EXCLUSIVE",
            semester: data.semester ?? null,
            careerId: data.careerId ?? null,
        },
    })

    revalidatePath("/admin/cursos")
    return course
})
