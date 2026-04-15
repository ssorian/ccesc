export type StudentStatus = "REGULAR" | "EXTRAORDINARIO" | "BAJA" | "BAJA_TEMPORAL"

export interface Student {
    id: string
    matricula: string
    status: StudentStatus
    careerId?: string | null
    userId: string
    institutionId?: string | null
    deletedAt?: Date | null
    user: {
        id: string
        name: string
        lastName: string
        email: string
    }
    career?: {
        id: string
        name: string
        code: string
    } | null
}
