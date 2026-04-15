"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const assignTeacherToCourse = authAction(
    z.object({ groupId: z.string(), courseId: z.string(), teacherId: z.string() }),
    async ({ groupId, courseId, teacherId }) => {
        const teacherGroup = await prisma.teacherGroup.create({
            data: { groupId, courseId, teacherId },
        })
        revalidatePath(`/admin/grupos/${groupId}`)
        return { success: true, data: teacherGroup }
    },
)
