"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    enrollmentId: z.string(),
    unitId: z.string(),
    sessionDate: z.coerce.date(),
    present: z.boolean(),
    justified: z.boolean().optional(),
    notes: z.string().optional(),
})

export const updateAttendance = authAction(schema, async ({ enrollmentId, unitId, sessionDate, present, justified, notes }, session) => {
    const { rows } = await db.query(
        `INSERT INTO "Attendance" (id,"enrollmentId","unitId","sessionDate",present,justified,notes,"registeredById","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
         ON CONFLICT ("enrollmentId","unitId","sessionDate") DO UPDATE SET
            present = EXCLUDED.present, justified = EXCLUDED.justified,
            notes = EXCLUDED.notes, "registeredById" = EXCLUDED."registeredById", "updatedAt" = NOW()
         RETURNING *`,
        [crypto.randomUUID(), enrollmentId, unitId, sessionDate, present, justified ?? false, notes ?? null, session.user.id],
    )
    revalidatePath("/profesores/asistencias")
    return rows[0]
})
