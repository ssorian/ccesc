import { useQuery } from "@tanstack/react-query"
import { getCareers } from "@/features/careers/services/career.service"

export function useCareers() {
    return useQuery({
        queryKey: ["careers"],
        queryFn: getCareers,
    })
}

// Alias used by some components
export function useGetCareers() {
    return useCareers()
}
