import { useQuery } from "@tanstack/react-query"
import { getStudents, GetStudentsFilters } from "@/features/students/actions/student.actions"

export function useGetStudents(filters: GetStudentsFilters = {}) {
    return useQuery({
        queryKey: ["students", filters],
        queryFn: () => getStudents(filters),
    })
}
