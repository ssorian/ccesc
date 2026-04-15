"use server"

import db, { withTransaction } from "@/lib/db"
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

export const updateApplicantStatus = authAction(schema, async ({ id, status, matricula, password, schoolYearId }) => {
    const { rows: aRows } = await db.query(
        `SELECT a.*, ic."careerId", ic."institutionId"
         FROM "Applicant" a JOIN "InstitutionCareer" ic ON ic.id = a."institutionCareerId"
         WHERE a.id = $1`,
        [id],
    )
    if (aRows.length === 0) throw new Error("APPLICANT_NOT_FOUND")
    const applicant = aRows[0]

    await db.query(`UPDATE "Applicant" SET status = $1, "updatedAt" = NOW() WHERE id = $2`, [status, id])

    if (status === "ACCEPTED" && !applicant.studentId) {
        let resolvedSchoolYearId = schoolYearId
        if (!resolvedSchoolYearId) {
            const { rows: syRows } = await db.query(`SELECT id FROM "SchoolYear" WHERE status = 'ACTIVE' LIMIT 1`)
            if (syRows.length === 0) throw new Error("No hay ciclo escolar activo configurado")
            resolvedSchoolYearId = syRows[0].id
        }

        const finalMatricula = matricula ?? `ENR-${Date.now()}`
        const hashedPassword = await bcrypt.hash(password ?? "changeme123", 10)

        const getBirthday = (curp: string) => {
            try {
                const y = parseInt(curp.substring(4, 6)), m = parseInt(curp.substring(6, 8)) - 1, d = parseInt(curp.substring(8, 10))
                return new Date(y + (y < 50 ? 2000 : 1900), m, d)
            } catch { return new Date() }
        }

        const { student, groupName } = await withTransaction(async (client) => {
            const userId = crypto.randomUUID()
            await client.query(
                `INSERT INTO "User" (id, name, "lastName", email, "emailVerified", role, "createdAt", "updatedAt")
                 VALUES ($1,$2,$3,$4,false,'STUDENT',NOW(),NOW())`,
                [userId, applicant.name, applicant.lastName, applicant.email],
            )
            const { rows: sRows } = await client.query(
                `INSERT INTO "Student" (id,"enrollmentId",curp,"birthDay",phone,state,municipality,neighborhood,street,number,"careerId","institutionId","userId","currentSemester","createdAt","updatedAt")
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,1,NOW(),NOW()) RETURNING *`,
                [crypto.randomUUID(), finalMatricula, applicant.curp, getBirthday(applicant.curp),
                 applicant.phone ?? null, applicant.state, applicant.municipality, applicant.neighborhood,
                 applicant.street, applicant.number, applicant.careerId, applicant.institutionId, userId],
            )
            const student = sRows[0]

            await client.query(
                `INSERT INTO "Account" (id,"accountId","providerId","userId",password,"createdAt","updatedAt")
                 VALUES ($1,$2,'credential',$3,$4,NOW(),NOW())`,
                [`acc_${Date.now()}`, applicant.email, userId, hashedPassword],
            )
            await client.query(`UPDATE "Applicant" SET "studentId" = $1, "updatedAt" = NOW() WHERE id = $2`, [student.id, id])

            // Find or create group
            const { rows: cRows } = await client.query(`SELECT code FROM "Career" WHERE id = $1`, [applicant.careerId])
            const careerCode = cRows[0]?.code ?? "GRP"

            const { rows: gRows } = await client.query(
                `SELECT g.id, g.name, (SELECT COUNT(*) FROM "StudentGroup" sg WHERE sg."groupId" = g.id)::int AS cnt
                 FROM "Group" g WHERE g."careerId"=$1 AND g."institutionId"=$2 AND g.semester=1 AND g."schoolYearId"=$3
                 AND g."groupType"='CAREER_SEMESTER' AND g."deletedAt" IS NULL ORDER BY g.name ASC`,
                [applicant.careerId, applicant.institutionId, resolvedSchoolYearId],
            )
            let group = gRows.find((g) => g.cnt <= MAX_GROUP_CAPACITY)
            if (!group) {
                const suffix = String.fromCharCode(65 + gRows.length)
                const { rows: newG } = await client.query(
                    `INSERT INTO "Group" (id,name,"groupType","schoolYearId",semester,"careerId","institutionId","createdAt","updatedAt")
                     VALUES ($1,$2,'CAREER_SEMESTER',$3,1,$4,$5,NOW(),NOW()) RETURNING id, name`,
                    [crypto.randomUUID(), `${careerCode}-1${suffix}`, resolvedSchoolYearId, applicant.careerId, applicant.institutionId],
                )
                group = newG[0]
            }

            await client.query(
                `INSERT INTO "StudentGroup" (id,"studentId","groupId","createdAt","updatedAt") VALUES ($1,$2,$3,NOW(),NOW())`,
                [crypto.randomUUID(), student.id, group.id],
            )

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
