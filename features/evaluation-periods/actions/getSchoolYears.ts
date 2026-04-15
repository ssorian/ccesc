"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getSchoolYears = authAction(
    z.object({}).default({}),
    async () => {
        const { rows } = await db.query(
            `SELECT id, name, status FROM "SchoolYear" ORDER BY "startDate" DESC`,
        )
        return rows
    },
)
