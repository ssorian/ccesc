export type GroupStatus = "ACTIVO" | "INACTIVO" | "CERRADO"

export interface Group {
    id: string
    name: string
    status: GroupStatus
    period: string
    institutionId: string
    courseId?: string | null
    deletedAt?: Date | null
    course?: {
        id: string
        name: string
        code: string
    } | null
    members?: Array<{ studentId: string }>
    _count?: { members: number }
}
