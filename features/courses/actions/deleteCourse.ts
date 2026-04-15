"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteCourse = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const course = await prisma.course.update({
        where: { id },
        data: { deletedAt: new Date() },
    })
    revalidatePath("/admin/cursos")
    return course
})
