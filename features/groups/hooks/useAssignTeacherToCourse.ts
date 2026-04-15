import { useMutation, useQueryClient } from "@tanstack/react-query"
import { assignTeacherToCourse } from "@/features/groups/services/group.service"

export function useAssignTeacherToCourse() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: assignTeacherToCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}
