import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTeacher } from "@/features/teachers/services/teacher.service"

export function useDeleteTeacher() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteTeacher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] })
        },
    })
}
