import { useQuery } from "@tanstack/react-query"
import { getGroupById } from "@/features/groups/services/group.service"

export function useGetGroupById(id: string) {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: () => getGroupById({ id }),
    enabled: !!id,
  })
}

// Alias used by teacher pages — accepts object form { id }
export function useGroup({ id }: { id: string }) {
  return useGetGroupById(id)
}
