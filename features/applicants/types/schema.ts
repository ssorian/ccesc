import * as z from "zod"

export const submitApplicationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  careerId: z.string().optional(),
  institutionId: z.string().min(1, "La institución es requerida"),
  address: z.string().optional(),
  birthDate: z.string().optional(),
})

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>

// Stub — will connect to Server Action in the future
export async function submitApplication(data: SubmitApplicationInput) {
  return Promise.resolve({ success: false, message: "Not yet implemented" })
}
