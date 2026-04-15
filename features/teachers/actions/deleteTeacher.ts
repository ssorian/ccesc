"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteTeacher = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const teacher = await prisma.teacher.update({
        where: { id },
        data: { deletedAt: new Date() },
    })
    revalidatePath("/admin/profesores")
    return teacher
})
