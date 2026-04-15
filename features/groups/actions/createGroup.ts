"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { GroupType } from "@/lib/types"

const schema = z.object({
    name: z.string().min(1),
    groupType: z.nativeEnum(GroupType),
    schoolYearId: z.string(),
    institutionId: z.string().optional(),
    semester: z.number().int().positive().nullable().optional(),
    careerId: z.string().nullable().optional(),
})

export const createGroup = authAction(schema, async (data, session) => {
    let institutionId = data.institutionId

    if (!institutionId) {
        const { rows } = await db.query(
            `SELECT "institutionId" FROM "User" WHERE id = $1`,
            [session.user.id],
        )
        institutionId = rows[0]?.institutionId ?? undefined
    }

    if (!institutionId) {
        const { rows } = await db.query(`SELECT id FROM "Institution" WHERE "deletedAt" IS NULL LIMIT 1`)
        if (rows.length === 0) throw new Error("No hay institución configurada")
        institutionId = rows[0].id
    }

    const { rows } = await db.query(
        `INSERT INTO "Group" (id, name, "groupType", semester, "institutionId", "schoolYearId", "careerId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [
            crypto.randomUUID(),
            data.name,
            data.groupType,
            data.semester ?? null,
            institutionId,
            data.schoolYearId,
            data.careerId ?? null,
        ],
    )

    revalidatePath("/admin/grupos")
    return { success: true, data: rows[0] }
})
