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
                            <StudentGradesView rows={[
                                ...student.enrollments.map((e: any) => {
                                    const ordinary = (e.unitGrades ?? []).filter((ug: any) => ug.gradeType === "ORDINARY")
                                    const extra = (e.unitGrades ?? []).filter((ug: any) => ug.gradeType === "EXTRAORDINARY")
                                    const extraAvg = extra.length > 0
                                        ? extra.reduce((s: number, g: any) => s + (g.grade ?? 0), 0) / extra.length
                                        : null
                                    return {
                                        id: e.id,
                                        type: "enrollment" as const,
                                        courseName: e.course?.name ?? "",
                                        courseCode: e.course?.code ?? "",
                                        courseSemester: e.course?.semester ?? null,
                                        evaluationCount: e.course?.evaluationCount ?? null,
                                        unitGrades: ordinary.map((ug: any) => ({ unitNumber: ug.unit.unitNumber, grade: ug.grade })),
                                        extraordinaryGrade: extraAvg,
                                        unitsAverage: e.unitsAverage ?? null,
                                        finalGrade: e.finalGrade ?? null,
                                        status: e.status,
                                        passed: e.status === "PASSED",
                                        attendancesPresent: null,
                                        attendancesTotal: null,
                                        attendancePercentage: null,
                                        schoolYearName: e.schoolYear?.name ?? "",
                                    }
                                }),
                                ...student.academicHistory.map((h: any) => ({
                                    id: h.id,
                                    type: "history" as const,
                                    courseName: h.courseName,
                                    courseCode: h.courseCode,
                                    courseSemester: h.semester ?? null,
                                    evaluationCount: null,
                                    unitGrades: [],
                                    extraordinaryGrade: null,
                                    unitsAverage: h.unitsAverage ?? null,
                                    finalGrade: h.finalGrade ?? null,
                                    status: h.status,
                                    passed: h.passed,
                                    attendancesPresent: null,
                                    attendancesTotal: null,
                                    attendancePercentage: h.attendancePercentage != null ? Math.round(h.attendancePercentage) : null,
                                    schoolYearName: h.schoolYearName ?? "",
                                })),
                            ]} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
