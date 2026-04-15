import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createApplicant } from "@/features/applicants/services/applicant.service"

export function useCreateApplicant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createApplicant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applicants"] })
        },
    })
}
