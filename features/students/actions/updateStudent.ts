"use server"

import prisma from "@/lib/prisma"
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
    const student = await prisma.$transaction(async (tx) => {
        const existing = await tx.student.findUnique({ where: { id }, select: { userId: true } })
        if (!existing) throw new Error("STUDENT_NOT_FOUND")

        if (name != null || lastName != null || email != null) {
            await tx.user.update({
                where: { id: existing.userId },
                data: {
                    ...(name != null && { name }),
                    ...(lastName != null && { lastName }),
                    ...(email != null && { email }),
                },
            })
        }

        return tx.student.update({
            where: { id },
            data: {
                ...(status != null && { status }),
                ...(currentSemester != null && { currentSemester }),
                ...(careerId !== undefined && { careerId }),
            },
        })
    })

    revalidatePath("/admin/alumnos")
    revalidatePath(`/admin/alumnos/${id}`)
    return student
})
