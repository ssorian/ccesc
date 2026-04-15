import { useQuery } from "@tanstack/react-query"
import { getGrades } from "@/features/grades/services/grade.service"

export function useGrades(groupId: string) {
    return useQuery({
        queryKey: ["grades", groupId],
        queryFn: () => getGrades(groupId),
        enabled: !!groupId,
    })
}
