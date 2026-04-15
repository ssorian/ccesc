"use server"

import prisma from "@/lib/prisma"
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
    const teacher = await prisma.$transaction(async (tx) => {
        const existing = await tx.teacher.findUnique({ where: { id }, select: { userId: true } })
        if (!existing) throw new Error("TEACHER_NOT_FOUND")

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

        return tx.teacher.update({
            where: { id },
            data: {
                ...(employeeId != null && { employeeId }),
                ...(department != null && { department }),
                ...(status != null && { status }),
            },
        })
    })

    revalidatePath("/admin/profesores")
    revalidatePath(`/admin/profesores/${id}`)
    return teacher
})
