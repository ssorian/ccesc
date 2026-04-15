"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { TeacherStatus } from "@/lib/types"

const schema = z.object({
    search: z.string().optional(),
    status: z.nativeEnum(TeacherStatus).optional(),
    institutionId: z.string().optional(),
}).default({})

export const getTeachers = authAction(schema, async ({ search, status, institutionId }) => {
    const where = {
        deletedAt: null,
        ...(status != null && { status }),
        ...(institutionId != null && { institutionId }),
        ...(search != null && {
            OR: [
                { user: { name: { contains: search, mode: "insensitive" as const } } },
                { user: { lastName: { contains: search, mode: "insensitive" as const } } },
                { employeeId: { contains: search, mode: "insensitive" as const } },
            ],
        }),
    }

    const teachers = await prisma.teacher.findMany({
        where,
        include: {
            user: { select: { id: true, name: true, lastName: true, email: true, image: true } },
            institution: {
                select: { id: true, slug: true, user: { select: { name: true } } },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return teachers.map((t) => ({
        ...t,
        institution: { id: t.institution.id, slug: t.institution.slug, name: t.institution.user.name },
    }))
})

export type GetTeachersFilters = z.input<typeof schema>
