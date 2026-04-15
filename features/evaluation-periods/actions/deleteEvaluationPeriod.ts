"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const deleteEvaluationPeriod = authAction(
    z.object({ evaluationPeriodId: z.string() }),
    async ({ evaluationPeriodId }, session) => {
        if (!session.user.role || !["ADMIN", "INSTITUTION"].includes(session.user.role)) {
            throw new Error("FORBIDDEN")
        }

        const { rows } = await db.query(
            `SELECT status FROM "EvaluationPeriod" WHERE id = $1`,
            [evaluationPeriodId],
        )
        if (rows.length === 0) throw new Error("PERIOD_NOT_FOUND")
        if (rows[0].status !== "SCHEDULED") throw new Error("PERIOD_ALREADY_USED")

        await db.query(`DELETE FROM "EvaluationPeriod" WHERE id = $1`, [evaluationPeriodId])

        revalidatePath("/admin/periodos")
        return { success: true }
    },
)
