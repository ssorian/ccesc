import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateStudent } from "@/features/students/services/student.service"

export function useUpdateStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] })
        },
    })
}
