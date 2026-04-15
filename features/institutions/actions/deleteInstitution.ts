"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteInstitution = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const institution = await prisma.institution.update({
        where: { id },
        data: { deletedAt: new Date() },
    })
    revalidatePath("/admin/instituciones")
    return institution
})
