"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    schoolYearId: z.string(),
    name: z.string().min(1),
    evaluationNumber: z.number().int().min(1).max(4),
    isExtraordinary: z.boolean().default(false),
})

export const createEvaluationPeriod = authAction(schema, async (data, session) => {
    if (!session.user.role || !["ADMIN", "INSTITUTION"].includes(session.user.role)) {
        throw new Error("FORBIDDEN")
    }

    const { rows: existing } = await db.query(
        `SELECT id FROM "EvaluationPeriod"
         WHERE "schoolYearId" = $1 AND "evaluationNumber" = $2 AND "isExtraordinary" = $3`,
        [data.schoolYearId, data.evaluationNumber, data.isExtraordinary],
    )
    if (existing.length > 0) throw new Error("PERIOD_ALREADY_EXISTS")

    const { rows } = await db.query(
        `INSERT INTO "EvaluationPeriod" (id, "schoolYearId", name, "evaluationNumber", "isExtraordinary", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [
            crypto.randomUUID(),
            data.schoolYearId,
            data.name,
            data.evaluationNumber,
            data.isExtraordinary,
        ],
    )

    revalidatePath("/admin/periodos")
    return rows[0]
})
