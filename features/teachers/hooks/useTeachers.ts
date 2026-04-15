import { useQuery } from "@tanstack/react-query"
import { getTeachers } from "@/features/teachers/services/teacher.service"

export function useTeachers() {
    return useQuery({
        queryKey: ["teachers"],
        queryFn: getTeachers,
    })
}
