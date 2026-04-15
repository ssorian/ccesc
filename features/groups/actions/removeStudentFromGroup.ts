"use server"

import prisma from "@/lib/prisma"
import { authAction } from "@/lib/auth-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const removeStudentFromGroup = authAction(
    z.object({ groupId: z.string(), studentId: z.string() }),
    async ({ groupId, studentId }) => {
        const studentGroup = await prisma.studentGroup.delete({
            where: { studentId_groupId: { studentId, groupId } },
        })
        revalidatePath(`/admin/grupos/${groupId}`)
        return { success: true, data: studentGroup }
    },
)
