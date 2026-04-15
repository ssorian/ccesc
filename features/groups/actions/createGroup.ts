"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { GroupType } from "@/lib/types"

const schema = z.object({
    name: z.string().min(1),
    groupType: z.nativeEnum(GroupType),
    schoolYearId: z.string(),
    institutionId: z.string().optional(),
    semester: z.number().int().positive().nullable().optional(),
    careerId: z.string().nullable().optional(),
})

export const createGroup = authAction(schema, async (data, session) => {
    let institutionId = data.institutionId

    if (!institutionId) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { institutionId: true },
        })
        institutionId = user?.institutionId ?? undefined
    }

    if (!institutionId) {
        const inst = await prisma.institution.findFirst({
            where: { deletedAt: null },
            select: { id: true },
        })
        if (!inst) throw new Error("No hay institución configurada")
        institutionId = inst.id
    }

    const group = await prisma.group.create({
        data: {
            name: data.name,
            groupType: data.groupType,
            semester: data.semester ?? null,
            institutionId: institutionId!,
            schoolYearId: data.schoolYearId,
            careerId: data.careerId ?? null,
        },
    })

    revalidatePath("/admin/grupos")
    return { success: true, data: group }
})
