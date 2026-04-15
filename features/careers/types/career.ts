export interface Career {
    id: string
    name: string
    code: string
    description?: string | null
    semester?: number | null
    totalSemesters?: number | null
    institutionCareers?: Array<{
        institutionId: string
        institution: {
            id: string
            name: string
        }
    }>
}
