import { useQuery } from "@tanstack/react-query"
import { getCourseAssignments } from "@/features/groups/services/group.service"

export function useCourseAssignments(groupId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ["groups", groupId, "courseAssignments"],
        queryFn: () => getCourseAssignments({ groupId }),
        enabled: !!groupId && enabled,
    })
}
