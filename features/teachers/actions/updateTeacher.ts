"use server"

import db, { withTransaction } from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { TeacherStatus } from "@/lib/types"

const schema = z.object({
    id: z.string(),
    name: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    employeeId: z.string().optional(),
    department: z.string().optional(),
    status: z.nativeEnum(TeacherStatus).optional(),
})

export const updateTeacher = authAction(schema, async ({ id, name, lastName, email, employeeId, department, status }) => {
    const teacher = await withTransaction(async (client) => {
        const { rows: tr } = await client.query(`SELECT "userId" FROM "Teacher" WHERE id = $1`, [id])
        if (tr.length === 0) throw new Error("TEACHER_NOT_FOUND")
        const { userId } = tr[0]

        const uSets: string[] = [`"updatedAt" = NOW()`]; const uP: unknown[] = []; let ui = 1
        if (name != null) { uSets.push(`name = $${ui++}`); uP.push(name) }
        if (lastName != null) { uSets.push(`"lastName" = $${ui++}`); uP.push(lastName) }
        if (email != null) { uSets.push(`email = $${ui++}`); uP.push(email) }
        if (uSets.length > 1) { uP.push(userId); await client.query(`UPDATE "User" SET ${uSets.join(", ")} WHERE id = $${ui}`, uP) }

        const tSets: string[] = [`"updatedAt" = NOW()`]; const tP: unknown[] = []; let ti = 1
        if (employeeId != null) { tSets.push(`"employeeId" = $${ti++}`); tP.push(employeeId) }
        if (department != null) { tSets.push(`department = $${ti++}`); tP.push(department) }
        if (status != null) { tSets.push(`status = $${ti++}`); tP.push(status) }
        tP.push(id)
        const { rows } = await client.query(`UPDATE "Teacher" SET ${tSets.join(", ")} WHERE id = $${ti} RETURNING *`, tP)
        return rows[0]
    })

    revalidatePath("/admin/profesores")
    revalidatePath(`/admin/profesores/${id}`)
    return teacher
})
