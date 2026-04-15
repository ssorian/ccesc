export interface Institution {
    id: string
    name: string
    slug: string
    address?: string | null
    enableGlobalEvaluation: boolean
    deletedAt?: Date | null
}
