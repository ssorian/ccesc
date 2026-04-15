import * as z from "zod"
import { GroupType } from "@/lib/types"

export const createGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  period: z.string().min(1, "El periodo es requerido"),
  groupType: z.nativeEnum(GroupType).default(GroupType.CAREER_SEMESTER),
  courseId: z.string().optional().nullable(),
  careerId: z.string().optional().nullable(),
  semester: z.number().optional().nullable(),
  status: z.enum(["ACTIVO", "INACTIVO", "CERRADO"]).default("ACTIVO"),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>

export const updateGroupSchema = createGroupSchema.partial()

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
