"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    groupId: z.string(),
    minSemester: z.number().int().nullable().optional(),
    careerId: z.string().nullable().optional(),
    maxCapacity: z.number().int().nullable().optional(),
    enrollmentStart: z.coerce.date().nullable().optional(),
    enrollmentEnd: z.coerce.date().nullable().optional(),
    isOpen: z.boolean().optional(),
})

export const upsertEnrollmentRequirement = authAction(schema, async ({ groupId, ...data }) => {
    const req = await prisma.enrollmentRequirement.upsert({
        where: { groupId },
        create: {
            groupId,
            minSemester: data.minSemester ?? null,
            careerId: data.careerId ?? null,
            maxCapacity: data.maxCapacity ?? null,
            enrollmentStart: data.enrollmentStart ?? null,
            enrollmentEnd: data.enrollmentEnd ?? null,
            isOpen: data.isOpen ?? true,
        },
        update: {
            minSemester: data.minSemester ?? null,
            careerId: data.careerId ?? null,
            maxCapacity: data.maxCapacity ?? null,
            enrollmentStart: data.enrollmentStart ?? null,
            enrollmentEnd: data.enrollmentEnd ?? null,
            ...(data.isOpen !== undefined && { isOpen: data.isOpen }),
        },
    })
    revalidatePath("/admin/cursos")
    return req
})

export type EnrollmentRequirementData = z.input<typeof schema>
