"use server"

import db, { withTransaction } from "@/lib/db"
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

    const institution = await withTransaction(async (client) => {
        const userId = crypto.randomUUID()
        await client.query(
            `INSERT INTO "User" (id, name, "lastName", email, "emailVerified", role, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, false, 'INSTITUTION', NOW(), NOW())`,
            [userId, data.name, data.adminLastName ?? null, data.adminEmail],
        )
        const { rows } = await client.query(
            `INSERT INTO "Institution" (id, "userId", slug, address, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
            [crypto.randomUUID(), userId, data.slug, data.address ?? null],
        )
        if (hashedPassword) {
            await client.query(
                `INSERT INTO "Account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
                 VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())`,
                [`acc_${Date.now()}`, data.adminEmail, userId, hashedPassword],
            )
        }
        return rows[0]
    })

    revalidatePath("/admin/instituciones")
    return institution
})
