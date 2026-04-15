import { useQuery } from "@tanstack/react-query"
import { getInstitutions } from "@/features/institutions/services/institution.service"

export function useInstitutions() {
    return useQuery({
        queryKey: ["institutions"],
        queryFn: getInstitutions,
    })
}
