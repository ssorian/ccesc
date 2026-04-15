"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const removeTeacherFromCourse = authAction(
    z.object({ assignmentId: z.string(), groupId: z.string() }),
    async ({ assignmentId, groupId }) => {
        const teacherGroup = await prisma.teacherGroup.delete({ where: { id: assignmentId } })
        revalidatePath(`/admin/grupos/${groupId}`)
        return { success: true, data: teacherGroup }
    },
)
