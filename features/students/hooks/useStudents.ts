import { useQuery } from "@tanstack/react-query"
import { getStudents } from "@/features/students/services/student.service"

export function useStudents() {
    return useQuery({
        queryKey: ["students"],
        queryFn: getStudents,
    })
}
