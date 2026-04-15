"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getApplicantById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows } = await db.query(
        `SELECT a.*,
            json_build_object(
                'id', ic.id,
                'career', json_build_object('id', c.id, 'name', c.name, 'code', c.code, 'totalSemesters', c."totalSemesters"),
                'institution', json_build_object('id', inst.id, 'slug', inst.slug, 'name', u.name)
            ) AS "institutionCareer"
         FROM "Applicant" a
         JOIN "InstitutionCareer" ic ON ic.id = a."institutionCareerId"
         JOIN "Career" c ON c.id = ic."careerId"
         JOIN "Institution" inst ON inst.id = ic."institutionId"
         JOIN "User" u ON u.id = inst."userId"
         WHERE a.id = $1`,
        [id],
    )
    if (rows.length === 0) return null

    let student = null
    if (rows[0].studentId) {
        const { rows: sRows } = await db.query(
            `SELECT s.*, json_build_object('id', u.id, 'name', u.name, 'lastName', u."lastName", 'email', u.email) AS "user"
             FROM "Student" s JOIN "User" u ON u.id = s."userId" WHERE s.id = $1`,
            [rows[0].studentId],
        )
        student = sRows[0] ?? null
    }

    return { ...rows[0], student }
})
