"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getEvaluationPeriods = authAction(
    z.object({ schoolYearId: z.string().optional() }).default({}),
    async ({ schoolYearId }) => {
        const params: unknown[] = []
        let where = ""
        if (schoolYearId != null) {
            where = `WHERE ep."schoolYearId" = $1`
            params.push(schoolYearId)
        }

        const { rows } = await db.query(
            `SELECT ep.*,
                json_build_object('id', sy.id, 'name', sy.name) AS "schoolYear"
             FROM "EvaluationPeriod" ep
             JOIN "SchoolYear" sy ON sy.id = ep."schoolYearId"
             ${where}
             ORDER BY sy.name DESC, ep."evaluationNumber" ASC`,
            params,
        )
        return rows
    },
)
