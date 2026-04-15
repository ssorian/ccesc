"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"
import { StudentStatus } from "@/lib/types"

const schema = z.object({
    search: z.string().optional(),
    status: z.nativeEnum(StudentStatus).optional(),
    careerId: z.string().optional(),
    institutionId: z.string().optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().optional(),
}).default({})

export const getStudents = authAction(schema, async (filters) => {
    const { search, status, careerId, institutionId, page = 1, pageSize = 10 } = filters

    const where = {
        deletedAt: null,
        ...(status != null && { status }),
        ...(careerId != null && { careerId }),
        ...(institutionId != null && { institutionId }),
        ...(search != null && {
            OR: [
                { user: { name: { contains: search, mode: "insensitive" as const } } },
                { user: { lastName: { contains: search, mode: "insensitive" as const } } },
                { enrollmentId: { contains: search, mode: "insensitive" as const } },
                { curp: { contains: search, mode: "insensitive" as const } },
            ],
        }),
    }

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, lastName: true, email: true } },
                career: { select: { id: true, name: true, code: true } },
                institution: {
                    select: { id: true, slug: true, user: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.student.count({ where }),
    ])

    return {
        students: students.map((s) => ({
            ...s,
            institution: { id: s.institution.id, slug: s.institution.slug, name: s.institution.user.name },
        })),
        total,
        page,
        pageSize,
    }
})

export type GetStudentsFilters = z.input<typeof schema>
