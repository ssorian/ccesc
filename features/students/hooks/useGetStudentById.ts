import { useQuery } from "@tanstack/react-query"
import { getStudentById } from "@/features/students/services/student.service"

export function useGetStudentById(id: string) {
    return useQuery({
        queryKey: ["students", id],
        queryFn: () => getStudentById({ id }),
        enabled: !!id,
    })
}
