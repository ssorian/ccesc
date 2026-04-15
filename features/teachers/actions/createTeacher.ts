"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    name: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    employeeId: z.string().min(1),
    department: z.string().min(1),
    institutionId: z.string().min(1),
})

export const createTeacher = authAction(schema, async (data) => {
    const teacher = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                emailVerified: false,
                role: "TEACHER",
            },
        })
        return tx.teacher.create({
            data: {
                employeeId: data.employeeId,
                department: data.department,
                institutionId: data.institutionId,
                userId: user.id,
            },
        })
    })
    revalidatePath("/admin/profesores")
    return teacher
})
