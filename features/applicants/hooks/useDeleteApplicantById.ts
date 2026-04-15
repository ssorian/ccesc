import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteApplicant } from "@/features/applicants/services/applicant.service"

export function useDeleteApplicantById() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteApplicant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applicants"] })
        },
    })
}
