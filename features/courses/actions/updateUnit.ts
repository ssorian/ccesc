"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    unitId: z.string(),
    name: z.string().min(1).optional(),
    weight: z.number().positive().optional(),
    description: z.string().optional().nullable(),
})

export const updateUnit = authAction(schema, async ({ unitId, name, weight, description }, session) => {
    if (session.user.role !== "ADMIN") {
        throw new Error("FORBIDDEN")
    }

    const existing = await prisma.unit.findUnique({ where: { id: unitId }, select: { lockedAt: true } })
    if (!existing) throw new Error("UNIT_NOT_FOUND")
    if (existing.lockedAt && weight !== undefined) throw new Error("UNIT_LOCKED")

    const unit = await prisma.unit.update({
        where: { id: unitId },
        data: {
            ...(name !== undefined && { name }),
            ...(weight !== undefined && { weight }),
            ...(description !== undefined && { description }),
        },
    })

    revalidatePath("/admin/cursos")
    return unit
})
