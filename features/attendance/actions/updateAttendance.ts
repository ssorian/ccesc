"use server"

import prisma from "@/lib/prisma"
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
    const attendance = await prisma.attendance.upsert({
        where: { enrollmentId_unitId_sessionDate: { enrollmentId, unitId, sessionDate } },
        create: {
            enrollmentId,
            unitId,
            sessionDate,
            present,
            justified: justified ?? false,
            notes: notes ?? null,
            registeredBy: { connect: { userId: session.user.id } },
        },
        update: {
            present,
            justified: justified ?? false,
            notes: notes ?? null,
            registeredBy: { connect: { userId: session.user.id } },
        },
    })
    revalidatePath("/profesores/asistencias")
    return attendance
})
