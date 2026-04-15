export type AttendanceStatus = "PRESENTE" | "AUSENTE" | "JUSTIFICADO"

export interface AttendanceRecord {
    id: string
    studentId: string
    groupId: string
    date: Date
    status: AttendanceStatus
    student?: {
        id: string
        user: {
            name: string
            lastName: string
        }
    }
}
