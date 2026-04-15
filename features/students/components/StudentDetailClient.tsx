"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { StudentGeneralForm } from "./StudentGeneralForm"
import { StudentGradesView } from "./StudentGradesView"

interface StudentDetailClientProps {
    student: any
}

export function StudentDetailClient({ student }: StudentDetailClientProps) {
    const router = useRouter()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {student.user.name} {student.user.lastName}
                    </h1>
                    <p className="text-muted-foreground">
                        Matrícula: {student.matricula} | {student.career?.name}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList>
                    <TabsTrigger value="general">Información General</TabsTrigger>
                    <TabsTrigger value="grades">Kardex / Calificaciones</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                            <CardDescription>
                                Datos personales y académicos básicos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StudentGeneralForm student={student} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="grades">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial Académico</CardTitle>
                            <CardDescription>
                                Gestión de calificaciones por semestre.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StudentGradesView student={student} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
