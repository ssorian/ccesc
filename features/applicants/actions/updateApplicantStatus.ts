"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ApplicantStatus } from "@/lib/types"
import bcrypt from "bcryptjs"

const MAX_GROUP_CAPACITY = 50

const schema = z.object({
    id: z.string(),
    status: z.nativeEnum(ApplicantStatus),
    matricula: z.string().optional(),
    password: z.string().optional(),
    schoolYearId: z.string().optional(),
})

const getBirthday = (curp: string) => {
    try {
        const y = parseInt(curp.substring(4, 6)), m = parseInt(curp.substring(6, 8)) - 1, d = parseInt(curp.substring(8, 10))
        return new Date(y + (y < 50 ? 2000 : 1900), m, d)
    } catch { return new Date() }
}

export const updateApplicantStatus = authAction(schema, async ({ id, status, matricula, password, schoolYearId }) => {
    const applicant = await prisma.applicant.findUnique({
        where: { id },
        include: {
            institutionCareer: { select: { careerId: true, institutionId: true, career: { select: { code: true } } } },
        },
    })
    if (!applicant) throw new Error("APPLICANT_NOT_FOUND")

    await prisma.applicant.update({ where: { id }, data: { status } })

    if (status === "ACCEPTED" && !applicant.studentId) {
        let resolvedSchoolYearId = schoolYearId
        if (!resolvedSchoolYearId) {
            const activeYear = await prisma.schoolYear.findFirst({
                where: { status: "ACTIVE" },
                select: { id: true },
            })
            if (!activeYear) throw new Error("No hay ciclo escolar activo configurado")
            resolvedSchoolYearId = activeYear.id
        }

        const finalMatricula = matricula ?? `ENR-${Date.now()}`
        const hashedPassword = await bcrypt.hash(password ?? "changeme123", 10)
        const { careerId, institutionId, career } = applicant.institutionCareer

        const { student, groupName } = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: applicant.name,
                    lastName: applicant.lastName,
                    email: applicant.email,
                    emailVerified: false,
                    role: "STUDENT",
                },
            })

            const student = await tx.student.create({
                data: {
                    enrollmentId: finalMatricula,
                    curp: applicant.curp,
                    birthDay: getBirthday(applicant.curp),
                    phone: applicant.phone ?? null,
                    state: applicant.state,
                    municipality: applicant.municipality,
                    neighborhood: applicant.neighborhood,
                    street: applicant.street,
                    number: applicant.number,
                    careerId,
                    institutionId,
                    userId: user.id,
                    currentSemester: 1,
                },
            })

            await tx.account.create({
                data: {
                    id: `acc_${Date.now()}`,
                    accountId: applicant.email,
                    providerId: "credential",
                    userId: user.id,
                    password: hashedPassword,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            })

            await tx.applicant.update({ where: { id }, data: { studentId: student.id } })

            const existingGroups = await tx.group.findMany({
                where: {
                    careerId,
                    institutionId,
                    semester: 1,
                    schoolYearId: resolvedSchoolYearId,
                    groupType: "CAREER_SEMESTER",
                    deletedAt: null,
                },
                include: { _count: { select: { studentGroups: true } } },
                orderBy: { name: "asc" },
            })

            let group = existingGroups.find((g) => g._count.studentGroups <= MAX_GROUP_CAPACITY)
            if (!group) {
                const suffix = String.fromCharCode(65 + existingGroups.length)
                const careerCode = career?.code ?? "GRP"
                group = await tx.group.create({
                    data: {
                        name: `${careerCode}-1${suffix}`,
                        groupType: "CAREER_SEMESTER",
                        schoolYearId: resolvedSchoolYearId!,
                        semester: 1,
                        careerId,
                        institutionId,
                    },
                    include: { _count: { select: { studentGroups: true } } },
                })
            }

            await tx.studentGroup.create({
                data: { studentId: student.id, groupId: group.id },
            })

            return { student, groupName: group.name }
        })

        revalidatePath("/institution/aspirantes")
        revalidatePath("/institution/alumnos")
        revalidatePath("/institution/grupos")
        revalidatePath("/admin/aspirantes")
        return { success: true, data: { applicant, student, groupName } }
    }

    revalidatePath("/institution/aspirantes")
    revalidatePath("/admin/aspirantes")
    return { success: true, data: { applicant } }
})
