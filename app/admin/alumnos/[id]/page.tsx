import { notFound } from "next/navigation"
import { StudentDetailClient } from "@/features/students/components/StudentDetailClient"
import { getStudentById } from "@/features/students/actions/student.actions"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Detalle de Alumno | Administración",
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: PageProps) {
    const { id } = await params
    const student = await getStudentById({ id })

    if (!student) {
        notFound()
    }

    return <StudentDetailClient student={student} />
}
