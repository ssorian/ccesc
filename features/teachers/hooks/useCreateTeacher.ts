import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTeacher } from "@/features/teachers/services/teacher.service"

export function useCreateTeacher() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createTeacher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] })
        },
    })
}
