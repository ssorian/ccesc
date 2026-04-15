"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const toggleInstitutionStatus = authAction(
    z.object({ id: z.string(), activate: z.boolean() }),
    async ({ id, activate }) => {
        const institution = await prisma.institution.update({
            where: { id },
            data: { deletedAt: activate ? null : new Date() },
        })
        revalidatePath("/admin/instituciones")
        return institution
    },
)
