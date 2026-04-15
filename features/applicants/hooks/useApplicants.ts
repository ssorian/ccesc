import { useQuery } from "@tanstack/react-query"
import { getApplicants } from "@/features/applicants/services/applicant.service"

export function useApplicants() {
    return useQuery({
        queryKey: ["applicants"],
        queryFn: getApplicants,
    })
}

// Alias used by some components
export function useGetApplicants() {
    return useApplicants()
}
