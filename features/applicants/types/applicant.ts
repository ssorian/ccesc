export type ApplicantStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO"

export interface Applicant {
    id: string
    name: string
    lastName: string
    email: string
    phone?: string | null
    careerId?: string | null
    institutionId: string
    status: ApplicantStatus
    createdAt: Date
    career?: {
        id: string
        name: string
    } | null
    institution?: {
        id: string
        name: string
    } | null
}
