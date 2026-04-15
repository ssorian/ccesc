import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateStudentGrade } from "@/features/grades/services/grade.service"

export function useUpdateStudentGrade() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateStudentGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["grades"] })
        },
    })
}
