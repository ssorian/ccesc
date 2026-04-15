import { useQuery } from "@tanstack/react-query"
import { getApplicantById } from "@/features/applicants/services/applicant.service"

export function useGetApplicantById(id: string) {
    return useQuery({
        queryKey: ["applicants", id],
        queryFn: () => getApplicantById(id),
        enabled: !!id,
    })
}
