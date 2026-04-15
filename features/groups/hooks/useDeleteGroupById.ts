import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteGroup } from "@/features/groups/services/group.service"

export function useDeleteGroupById() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}
