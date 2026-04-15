"use client"

import { StudentGeneralForm } from "@/features/students/components/StudentGeneralForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const mockStudent = {
    id: "1",
    matricula: "2023001",
    curp: "PERJ050101HDFRRN01",
    user: {
        name: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
    },
    career: {
        name: "Ingeniería en Sistemas"
    },
    semestre: "5to",
    grupo: "A",
    situacion: "Regular",
}

export default function StudentDataPage() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Datos del Alumno</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>
                        Datos personales y académicos básicos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StudentGeneralForm student={mockStudent} />
                </CardContent>
            </Card>
        </div>
    )
}
