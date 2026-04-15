"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    address: z.string().optional(),
    adminLastName: z.string().optional(),
    adminEmail: z.string().email(),
    adminPassword: z.string().optional(),
})

export const createInstitution = authAction(schema, async (data) => {
    const hashedPassword = data.adminPassword ? await bcrypt.hash(data.adminPassword, 10) : null

    const institution = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: data.name,
                lastName: data.adminLastName ?? null,
                email: data.adminEmail,
                emailVerified: false,
                role: "INSTITUTION",
            },
        })
        const inst = await tx.institution.create({
            data: {
                userId: user.id,
                slug: data.slug,
                address: data.address ?? null,
            },
        })
        if (hashedPassword) {
            await tx.account.create({
                data: {
                    id: `acc_${Date.now()}`,
                    accountId: data.adminEmail,
                    providerId: "credential",
                    userId: user.id,
                    password: hashedPassword,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            })
        }
        return inst
    })

    revalidatePath("/admin/instituciones")
    return institution
})
