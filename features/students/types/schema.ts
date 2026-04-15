import * as z from "zod"

export const createStudentSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  matricula: z.string().min(1, "La matrícula es requerida"),
  curp: z.string().optional(),
  careerId: z.string().optional(),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>

export const updateStudentSchema = createStudentSchema.partial()

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
