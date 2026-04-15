"use client"

import { StudentGradesView } from "@/features/students/components/StudentGradesView"

const studentInfo = {
    campus: "Campus Central",
    ciclo: "2025-2026",
    programa: "Ingeniería de Software",
    semestre: "2º Semestre",
    grupo: "A",
}

const mockStudent = {
    academicHistory: [],
    enrollments: [
        {
            id: "e1",
            courseId: "MAT-001",
            course: { name: "Matemáticas Avanzadas", code: "MAT-001", semester: 1 },
            finalGrade: 9.2,
            status: "APROBADO",
            attendances: new Array(28).fill({ present: true }).concat(new Array(2).fill({ present: false }))
        },
        {
            id: "e2",
            courseId: "FIS-002",
            course: { name: "Física Cuántica", code: "FIS-002", semester: 1 },
            finalGrade: 8.5,
            status: "APROBADO",
            attendances: new Array(25).fill({ present: true }).concat(new Array(5).fill({ present: false }))
        },
        {
            id: "e3",
            courseId: "PROG-003",
            course: { name: "Programación Orientada a Objetos", code: "PROG-003", semester: 2 },
            finalGrade: 9.8,
            status: "APROBADO",
            attendances: new Array(29).fill({ present: true }).concat(new Array(1).fill({ present: false }))
        }
    ]
}

export default function GradesPage() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Calificaciones</h2>

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-5">
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Campus</span>
                    <span className="text-sm font-medium">{studentInfo.campus}</span>
                </div>
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Ciclo Escolar</span>
                    <span className="text-sm font-medium">{studentInfo.ciclo}</span>
                </div>
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Programa</span>
                    <span className="text-sm font-medium">{studentInfo.programa}</span>
                </div>
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Semestre</span>
                    <span className="text-sm font-medium">{studentInfo.semestre}</span>
                </div>
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Grupo</span>
                    <span className="text-sm font-medium">{studentInfo.grupo}</span>
                </div>
            </div>

            <StudentGradesView student={mockStudent} />
        </div>
    )
}
