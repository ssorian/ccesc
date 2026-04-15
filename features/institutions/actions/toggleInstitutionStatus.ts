"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const toggleInstitutionStatus = authAction(
    z.object({ id: z.string(), activate: z.boolean() }),
    async ({ id, activate }) => {
        const { rows } = await db.query(
            `UPDATE "Institution" SET "deletedAt" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
            [activate ? null : new Date(), id],
        )
        revalidatePath("/admin/instituciones")
        return rows[0]
    },
)
