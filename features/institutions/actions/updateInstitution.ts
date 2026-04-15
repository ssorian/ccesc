"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    id: z.string(),
    name: z.string().optional(),
    slug: z.string().optional(),
    address: z.string().nullable().optional(),
    enableGlobalEvaluation: z.boolean().optional(),
})

export const updateInstitution = authAction(schema, async ({ id, name, ...rest }) => {
    const institution = await prisma.$transaction(async (tx) => {
        if (name != null) {
            const inst = await tx.institution.findUnique({ where: { id }, select: { userId: true } })
            if (inst) {
                await tx.user.update({ where: { id: inst.userId }, data: { name } })
            }
        }
        return tx.institution.update({
            where: { id },
            data: {
                ...(rest.slug !== undefined && { slug: rest.slug }),
                ...(rest.address !== undefined && { address: rest.address }),
                ...(rest.enableGlobalEvaluation !== undefined && { enableGlobalEvaluation: rest.enableGlobalEvaluation }),
            },
        })
    })
    revalidatePath("/admin/instituciones")
    revalidatePath(`/admin/instituciones/${id}`)
    return institution
})
