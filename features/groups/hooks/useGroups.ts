import { useQuery } from "@tanstack/react-query"
import { getGroups } from "@/features/groups/services/group.service"

export function useGroups() {
    return useQuery({
        queryKey: ["groups"],
        queryFn: getGroups,
    })
}
