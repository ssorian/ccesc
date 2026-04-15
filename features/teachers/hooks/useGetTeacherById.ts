import { useQuery } from "@tanstack/react-query"
import { getTeacherById } from "@/features/teachers/services/teacher.service"

interface UseGetTeacherByIdOptions {
    id: string
}

export function useGetTeacherById({ id }: UseGetTeacherByIdOptions) {
    return useQuery({
        queryKey: ["teachers", id],
        queryFn: () => getTeacherById({ id }),
        enabled: !!id,
    })
}
