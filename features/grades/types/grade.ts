export interface Grade {
    id: string
    studentId: string
    groupId: string
    unit: number
    score?: number | null
    status?: string | null
    student?: {
        id: string
        matricula: string
        user: {
            name: string
            lastName: string
        }
    }
}
