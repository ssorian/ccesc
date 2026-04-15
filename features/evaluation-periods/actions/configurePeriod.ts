"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { EvaluationPeriodStatus } from "@/lib/types"

const PERIOD_NAMES: Record<number, string> = {
    1: "Primer Corte",
    2: "Segundo Corte",
    3: "Tercer Corte",
    4: "Cuarto Corte",
}

const schema = z.object({
    schoolYearId: z.string(),
    evaluationNumber: z.number().int().min(1).max(4),
    isExtraordinary: z.boolean().default(false),
    openDate: z.string().nullable(),
    closeDate: z.string().nullable(),
    status: z.nativeEnum(EvaluationPeriodStatus),
    reason: z.string().optional(),
})

export const configurePeriod = authAction(schema, async (data, session) => {
    if (!["ADMIN", "INSTITUTION"].includes(session.user.role!)) {
        throw new Error("FORBIDDEN")
    }

    const { rows: existingRows } = await db.query(
        `SELECT id, status FROM "EvaluationPeriod"
         WHERE "schoolYearId" = $1 AND "evaluationNumber" = $2 AND "isExtraordinary" = $3`,
        [data.schoolYearId, data.evaluationNumber, data.isExtraordinary],
    )

    const existing = existingRows[0] ?? null
    const previousStatus = existing?.status ?? null
    const newStatus = data.status

    if (previousStatus === "CLOSED" && newStatus === "OPEN") {
        if (!data.reason?.trim()) throw new Error("REASON_REQUIRED")
    }

    const name = data.isExtraordinary
        ? `Extraordinario ${data.evaluationNumber}`
        : (PERIOD_NAMES[data.evaluationNumber] ?? `Corte ${data.evaluationNumber}`)

    const result = await withTransaction(async (client) => {
        if (existing) {
            const { rows: updated } = await client.query(
                `UPDATE "EvaluationPeriod"
                 SET status = $1, "openDate" = $2, "closeDate" = $3, "updatedAt" = NOW()
                 WHERE id = $4
                 RETURNING *`,
                [
                    newStatus,
                    data.openDate ? new Date(data.openDate) : null,
                    data.closeDate ? new Date(data.closeDate) : null,
                    existing.id,
                ],
            )

            if (previousStatus && previousStatus !== newStatus) {
                await client.query(
                    `INSERT INTO "EvaluationPeriodAuditLog" (id, "evaluationPeriodId", "modifiedById", "previousStatus", "newStatus", reason, "createdAt")
                     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                    [
                        crypto.randomUUID(),
                        existing.id,
                        session.user.id,
                        previousStatus,
                        newStatus,
                        data.reason?.trim() ?? null,
                    ],
                )
            }

            return updated[0]
        }

        const { rows: created } = await client.query(
            `INSERT INTO "EvaluationPeriod" (id, "schoolYearId", "evaluationNumber", "isExtraordinary", name, status, "openDate", "closeDate", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
             RETURNING *`,
            [
                crypto.randomUUID(),
                data.schoolYearId,
                data.evaluationNumber,
                data.isExtraordinary,
                name,
                newStatus,
                data.openDate ? new Date(data.openDate) : null,
                data.closeDate ? new Date(data.closeDate) : null,
            ],
        )
        return created[0]
    })

    revalidatePath("/admin/periodos")
    return result
})
