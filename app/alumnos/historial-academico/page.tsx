"use client"

import { StudentGradesView } from "@/features/students/components/StudentGradesView"

const mockStudent = {
    academicHistory: [
        {
            id: "1",
            course: { name: "Matemáticas I", code: "MAT-1", semester: 1 },
            semester: 1,
            finalGrade: 9.5,
            status: "APROBADO",
        },
        {
            id: "2",
            course: { name: "Programación Básica", code: "PROG-1", semester: 1 },
            semester: 1,
            finalGrade: 10,
            status: "APROBADO",
        },
        {
            id: "3",
            course: { name: "Física I", code: "FIS-1", semester: 2 },
            semester: 2,
            finalGrade: 8.0,
            status: "APROBADO",
        },
    ]
}

export default function AcademicHistoryPage() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Historial Académico</h2>
            <StudentGradesView student={mockStudent} />
        </div>
    )
}
