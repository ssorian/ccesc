import { useQuery } from "@tanstack/react-query"
import { getAttendance } from "@/features/attendance/services/attendance.service"

export function useAttendance(groupId: string) {
    return useQuery({
        queryKey: ["attendance", groupId],
        queryFn: () => getAttendance(groupId),
        enabled: !!groupId,
    })
}
