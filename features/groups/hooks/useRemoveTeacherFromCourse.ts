import { useMutation, useQueryClient } from "@tanstack/react-query"
import { removeTeacherFromCourse } from "@/features/groups/services/group.service"

export function useRemoveTeacherFromCourse(groupId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ assignmentId }: { assignmentId: string }) =>
            removeTeacherFromCourse({ assignmentId, groupId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}
