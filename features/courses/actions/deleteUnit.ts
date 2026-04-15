"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteUnit = authAction(z.object({ unitId: z.string() }), async ({ unitId }, session) => {
    if (session.user.role !== "ADMIN") {
        throw new Error("FORBIDDEN")
    }

    const unit = await prisma.unit.findUnique({ where: { id: unitId }, select: { lockedAt: true } })
    if (!unit) throw new Error("UNIT_NOT_FOUND")
    if (unit.lockedAt) throw new Error("UNIT_LOCKED")

    await prisma.unit.delete({ where: { id: unitId } })

    revalidatePath("/admin/cursos")
    return { success: true }
})
