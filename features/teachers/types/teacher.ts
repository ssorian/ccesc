export type TeacherStatus = "ACTIVO" | "INACTIVO" | "LICENCIA"

export interface Teacher {
    id: string
    employeeId?: string | null
    department?: string | null
    status: TeacherStatus
    userId: string
    deletedAt?: Date | null
    user: {
        id: string
        name: string
        lastName: string
        email: string
    }
    groupAssignments?: Array<{
        id: string
        group: {
            id: string
            name: string
            status: string
            period: string
            course: {
                id: string
                name: string
                code: string
            }
            _count?: { members: number }
        }
    }>
}
