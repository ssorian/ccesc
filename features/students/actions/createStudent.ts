"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    name: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    enrollmentId: z.string().optional(),
    matricula: z.string().optional(),
    curp: z.string().optional(),
    institutionId: z.string().optional(),
    careerId: z.string().optional(),
    birthDay: z.coerce.date().optional(),
})

export const createStudent = authAction(schema, async (data, session) => {
    let targetInstitutionId = data.institutionId

    if (!targetInstitutionId && session?.user?.id) {
        const { rows } = await db.query(`SELECT "institutionId" FROM "User" WHERE id = $1`, [session.user.id])
        if (rows[0]?.institutionId) targetInstitutionId = rows[0].institutionId
    }

    if (!targetInstitutionId) throw new Error("Se requiere una institución para crear al alumno")

    const finalEnrollmentId = data.enrollmentId || data.matricula
    if (!finalEnrollmentId) throw new Error("La matrícula es requerida")

    const student = await withTransaction(async (client) => {
        const userId = crypto.randomUUID()
        await client.query(
            `INSERT INTO "User" (id, name, "lastName", email, "emailVerified", role, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, false, 'STUDENT', NOW(), NOW())`,
            [userId, data.name, data.lastName, data.email],
        )
        const { rows } = await client.query(
            `INSERT INTO "Student" (id, "enrollmentId", curp, "birthDay", "institutionId", "careerId", "userId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
            [crypto.randomUUID(), finalEnrollmentId, data.curp ?? "", data.birthDay ?? new Date(), targetInstitutionId, data.careerId ?? null, userId],
        )
        return rows[0]
    })

    revalidatePath("/admin/alumnos")
    return student
})
