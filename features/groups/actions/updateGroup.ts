"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { GroupType } from "@/lib/types"

const schema = z.object({
    id: z.string(),
    name: z.string().optional(),
    semester: z.number().int().positive().nullable().optional(),
    groupType: z.nativeEnum(GroupType).optional(),
})

export const updateGroup = authAction(schema, async ({ id, ...data }) => {
    const group = await prisma.group.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.semester !== undefined && { semester: data.semester }),
            ...(data.groupType !== undefined && { groupType: data.groupType }),
        },
    })

    revalidatePath("/admin/grupos")
    revalidatePath(`/admin/grupos/${id}`)
    return { success: true, data: group }
})
