"use server"

import prisma from "@/lib/prisma"
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
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { institutionId: true },
        })
        if (user?.institutionId) targetInstitutionId = user.institutionId
    }

    if (!targetInstitutionId) throw new Error("Se requiere una institución para crear al alumno")

    const finalEnrollmentId = data.enrollmentId || data.matricula
    if (!finalEnrollmentId) throw new Error("La matrícula es requerida")

    const student = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                emailVerified: false,
                role: "STUDENT",
            },
        })
        return tx.student.create({
            data: {
                enrollmentId: finalEnrollmentId,
                curp: data.curp ?? "",
                birthDay: data.birthDay ?? new Date(),
                institutionId: targetInstitutionId!,
                careerId: data.careerId ?? null,
                userId: user.id,
            },
        })
    })

    revalidatePath("/admin/alumnos")
    return student
})
