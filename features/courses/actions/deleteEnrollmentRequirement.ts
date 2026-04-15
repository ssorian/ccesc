"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteEnrollmentRequirement = authAction(z.object({ groupId: z.string() }), async ({ groupId }) => {
    const req = await prisma.enrollmentRequirement.delete({ where: { groupId } })
    revalidatePath("/admin/cursos")
    return req
})
