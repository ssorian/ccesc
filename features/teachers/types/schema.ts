import * as z from "zod"

export const createTeacherSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["ACTIVO", "INACTIVO", "LICENCIA"]).default("ACTIVO"),
})

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>

export const updateTeacherSchema = createTeacherSchema.partial()

export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>
