"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { EvaluationPeriodStatus } from "@/lib/types"

const schema = z.object({
    evaluationPeriodId: z.string(),
    newStatus: z.nativeEnum(EvaluationPeriodStatus),
    reason: z.string().optional(),
})

export const updateEvaluationPeriodStatus = authAction(schema, async (
    { evaluationPeriodId, newStatus, reason },
    session
) => {
    const { rows } = await db.query(
        `SELECT status FROM "EvaluationPeriod" WHERE id = $1`,
        [evaluationPeriodId],
    )
    if (rows.length === 0) throw new Error("PERIOD_NOT_FOUND")

    const previousStatus = rows[0].status

    if (previousStatus === "CLOSED" && newStatus === "OPEN") {
        if (!reason || reason.trim() === "") throw new Error("REASON_REQUIRED")
    }

    const result = await withTransaction(async (client) => {
        const { rows: updated } = await client.query(
            `UPDATE "EvaluationPeriod"
             SET status = $1,
                 "openDate" = CASE WHEN $1 = 'OPEN' THEN NOW() ELSE "openDate" END,
                 "closeDate" = CASE WHEN $1 = 'CLOSED' THEN NOW() ELSE "closeDate" END,
                 "updatedAt" = NOW()
             WHERE id = $2
             RETURNING *`,
            [newStatus, evaluationPeriodId],
        )

        await client.query(
            `INSERT INTO "EvaluationPeriodAuditLog" (id, "evaluationPeriodId", "modifiedById", "previousStatus", "newStatus", reason, "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
                crypto.randomUUID(),
                evaluationPeriodId,
                session.user.id,
                previousStatus,
                newStatus,
                reason?.trim() ?? null,
            ],
        )

        return updated[0]
    })

    revalidatePath("/admin/periodos")
    return result
})
