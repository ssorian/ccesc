"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    groupId: z.string(),
    minSemester: z.number().int().nullable().optional(),
    careerId: z.string().nullable().optional(),
    maxCapacity: z.number().int().nullable().optional(),
    enrollmentStart: z.coerce.date().nullable().optional(),
    enrollmentEnd: z.coerce.date().nullable().optional(),
    isOpen: z.boolean().optional(),
})

export const upsertEnrollmentRequirement = authAction(schema, async ({ groupId, ...data }) => {
    const { rows } = await db.query(
        `INSERT INTO "EnrollmentRequirement" (id, "groupId", "minSemester", "careerId", "maxCapacity", "enrollmentStart", "enrollmentEnd", "isOpen", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         ON CONFLICT ("groupId") DO UPDATE SET
            "minSemester" = EXCLUDED."minSemester",
            "careerId" = EXCLUDED."careerId",
            "maxCapacity" = EXCLUDED."maxCapacity",
            "enrollmentStart" = EXCLUDED."enrollmentStart",
            "enrollmentEnd" = EXCLUDED."enrollmentEnd",
            "isOpen" = EXCLUDED."isOpen",
            "updatedAt" = NOW()
         RETURNING *`,
        [
            crypto.randomUUID(),
            groupId,
            data.minSemester ?? null,
            data.careerId ?? null,
            data.maxCapacity ?? null,
            data.enrollmentStart ?? null,
            data.enrollmentEnd ?? null,
            data.isOpen ?? true,
        ],
    )
    revalidatePath("/admin/cursos")
    return rows[0]
})

export type EnrollmentRequirementData = z.input<typeof schema>
