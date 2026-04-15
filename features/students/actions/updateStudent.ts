"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { StudentStatus } from "@/lib/types"

const schema = z.object({
    id: z.string(),
    name: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    careerId: z.string().nullable().optional(),
    status: z.nativeEnum(StudentStatus).optional(),
    currentSemester: z.number().int().positive().optional(),
})

export const updateStudent = authAction(schema, async ({ id, name, lastName, email, careerId, status, currentSemester }) => {
    const student = await withTransaction(async (client) => {
        const { rows: sr } = await client.query(`SELECT "userId" FROM "Student" WHERE id = $1`, [id])
        if (sr.length === 0) throw new Error("STUDENT_NOT_FOUND")
        const { userId } = sr[0]

        const uSets: string[] = [`"updatedAt" = NOW()`]
        const uP: unknown[] = []; let ui = 1
        if (name != null) { uSets.push(`name = $${ui++}`); uP.push(name) }
        if (lastName != null) { uSets.push(`"lastName" = $${ui++}`); uP.push(lastName) }
        if (email != null) { uSets.push(`email = $${ui++}`); uP.push(email) }
        if (uSets.length > 1) { uP.push(userId); await client.query(`UPDATE "User" SET ${uSets.join(", ")} WHERE id = $${ui}`, uP) }

        const sSets: string[] = [`"updatedAt" = NOW()`]
        const sP: unknown[] = []; let si = 1
        if (status != null) { sSets.push(`status = $${si++}`); sP.push(status) }
        if (currentSemester != null) { sSets.push(`"currentSemester" = $${si++}`); sP.push(currentSemester) }
        if (careerId !== undefined) { sSets.push(`"careerId" = $${si++}`); sP.push(careerId) }
        sP.push(id)
        const { rows } = await client.query(`UPDATE "Student" SET ${sSets.join(", ")} WHERE id = $${si} RETURNING *`, sP)
        return rows[0]
    })

    revalidatePath("/admin/alumnos")
    revalidatePath(`/admin/alumnos/${id}`)
    return student
})
