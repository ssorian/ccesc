"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { CourseType } from "@/lib/types"

const schema = z.object({
    careerId: z.string().optional(),
    semester: z.number().int().positive().optional(),
    courseType: z.nativeEnum(CourseType).optional(),
}).default({})

export const getCourses = authAction(schema, async ({ careerId, semester, courseType }) => {
    const courses = await prisma.course.findMany({
        where: {
            deletedAt: null,
            ...(careerId != null && { careerId }),
            ...(semester != null && { semester }),
            ...(courseType != null && { courseType }),
        },
        include: {
            career: { select: { id: true, name: true, code: true } },
            _count: { select: { units: true, groupCourses: true } },
        },
        orderBy: [{ semester: "asc" }, { name: "asc" }],
    })
    return courses
})

export type GetCoursesFilters = z.input<typeof schema>
