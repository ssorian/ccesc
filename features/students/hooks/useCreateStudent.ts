import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createStudent } from "@/features/students/services/student.service"

export function useCreateStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] })
        },
    })
}
