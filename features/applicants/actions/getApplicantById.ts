"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getApplicantById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const applicant = await prisma.applicant.findUnique({
        where: { id },
        include: {
            institutionCareer: {
                include: {
                    career: { select: { id: true, name: true, code: true, totalSemesters: true } },
                    institution: { select: { id: true, slug: true, user: { select: { name: true } } } },
                },
            },
            student: {
                include: {
                    user: { select: { id: true, name: true, lastName: true, email: true } },
                },
            },
        },
    })
    if (!applicant) return null

    return {
        ...applicant,
        institutionCareer: {
            id: applicant.institutionCareer.id,
            career: applicant.institutionCareer.career,
            institution: {
                id: applicant.institutionCareer.institution.id,
                slug: applicant.institutionCareer.institution.slug,
                name: applicant.institutionCareer.institution.user.name,
            },
        },
    }
})
