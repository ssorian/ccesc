import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTeacher } from "@/features/teachers/services/teacher.service"

export function useUpdateTeacher() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateTeacher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] })
        },
    })
}
