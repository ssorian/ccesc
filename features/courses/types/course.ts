export interface Course {
    id: string
    name: string
    code: string
    description?: string | null
    credits?: number | null
    careerId?: string | null
    career?: {
        id: string
        name: string
    } | null
}
