"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteCareer = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const career = await prisma.career.update({
        where: { id },
        data: { deletedAt: new Date() },
    })
    revalidatePath("/admin/carreras")
    return career
})
