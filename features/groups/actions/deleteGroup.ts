"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteGroup = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const group = await prisma.group.update({
        where: { id },
        data: { deletedAt: new Date() },
    })
    revalidatePath("/admin/grupos")
    return { success: true, data: group }
})
