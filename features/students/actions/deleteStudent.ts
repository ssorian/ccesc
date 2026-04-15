"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteStudent = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const student = await prisma.student.update({
        where: { id },
        data: { deletedAt: new Date() },
    })
    revalidatePath("/admin/alumnos")
    return student
})
