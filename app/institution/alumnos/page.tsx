"use client"

import { StudentList } from "@/features/students/components/StudentList"
import { useGetStudents } from "@/features/students/hooks/useGetStudents"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function AlumnosPage() {
    const { data: students, isLoading, isError } = useGetStudents()

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-destructive">
                <AlertCircle className="h-10 w-10 mb-4" />
                <p className="text-lg">Error al cargar la lista de alumnos.</p>
            </div>
        )
    }

    return <StudentList initialData={students || []} />
}
