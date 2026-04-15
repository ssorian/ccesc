"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteApplicant = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const applicant = await prisma.applicant.delete({ where: { id } })
    revalidatePath("/institution/aspirantes")
    revalidatePath("/admin/aspirantes")
    return { success: true, data: applicant }
})
