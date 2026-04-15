"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useGetTeacherById } from "@/features/teachers/hooks/useGetTeacherById"
import { useGroup } from "@/features/groups/hooks/useGetGroupById"
import { useUpdateStudentGrade } from "@/features/grades/hooks/useUpdateStudentGrade"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Save } from "lucide-react"
import { GroupSelector } from "@/features/groups/components/GroupSelector"
import { EmptyState } from "@/components/shared/EmptyState"
import { GradeInput } from "@/features/grades/components/GradeInput"

export default function RegularizacionesPage() {
    const { data: session } = useSession()
    const [selectedGroup, setSelectedGroup] = useState<string>("")
    const [students, setStudents] = useState<any[]>([])
    const [regularizationGrades, setRegularizationGrades] = useState<Record<string, number | null>>({})
    const [hasChanges, setHasChanges] = useState(false)

    const { data: teacher, isLoading: isLoadingTeacher } = useGetTeacherById({
        id: session?.user?.id || "",
    })

    const { data: groupData, isLoading: isLoadingGroup } = useGroup({
        id: selectedGroup,
    })

    const updateGradeMutation = useUpdateStudentGrade()

    useEffect(() => {
        if (groupData?.members) {
            const mappedStudents = groupData.members
                .map((member: any) => member.student)
                .filter((student: any) => {
                    const enrollment = student.enrollments?.[0]
                    const finalGrade = enrollment?.finalGrade
                    // Show students who failed (grade < 6) or have no grade yet
                    return finalGrade === null || finalGrade === undefined || finalGrade < 6
                })
            setStudents(mappedStudents)
        }
    }, [groupData])

    const handleGradeChange = (studentId: string, grade: number | null) => {
        setRegularizationGrades(prev => ({
            ...prev,
            [studentId]: grade
        }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        if (!groupData) return

        for (const [studentId, grade] of Object.entries(regularizationGrades)) {
            if (grade !== null && grade >= 0 && grade <= 10) {
                await updateGradeMutation.mutateAsync({
                    studentId,
                    courseId: groupData.course.id,
                    period: groupData.period,
                    finalGrade: grade,
                    isGlobal: false,
                })
            }
        }

        setHasChanges(false)
        setRegularizationGrades({})
        alert("Calificaciones de regularización guardadas correctamente")
    }

    if (isLoadingTeacher) {
        return <div className="p-6">Cargando información...</div>
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Regularizaciones</h1>
                    <p className="text-muted-foreground">
                        Gestiona las calificaciones de regularización para alumnos reprobados.
                    </p>
                </div>
                {hasChanges && (
                    <Button onClick={handleSave} disabled={updateGradeMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {updateGradeMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                )}
            </div>

            {/* Group Selector */}
            <GroupSelector
                groups={teacher?.groupAssignments || []}
                selectedGroupId={selectedGroup}
                onGroupSelect={setSelectedGroup}
            />

            {/* Regularization List */}
            {selectedGroup && groupData ? (
                students.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Alumnos que Requieren Regularización</CardTitle>
                            <CardDescription>
                                {students.length} alumno{students.length !== 1 ? 's' : ''} con calificación menor a 6 o sin calificar
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Matrícula</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="text-center">Calificación Original</TableHead>
                                            <TableHead className="text-center">Cal. Regularización</TableHead>
                                            <TableHead className="text-center">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => {
                                            const enrollment = student.enrollments?.[0]
                                            const originalGrade = enrollment?.finalGrade
                                            const regularizationGrade = regularizationGrades[student.id]

                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">{student.matricula}</TableCell>
                                                    <TableCell>{student.user.name} {student.user.lastName}</TableCell>
                                                    <TableCell className="text-center">
                                                        {originalGrade !== null && originalGrade !== undefined ? (
                                                            <span className="text-red-600 font-semibold">
                                                                {originalGrade.toFixed(1)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">Sin calificar</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center">
                                                            <GradeInput
                                                                value={regularizationGrade ?? null}
                                                                onChange={(val) => handleGradeChange(student.id, val)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={student.status === "REGULAR" ? "default" : "destructive"}>
                                                            {student.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <EmptyState
                        icon={<BookOpen className="h-12 w-12 text-muted-foreground/50" />}
                        title="¡Excelente!"
                        description="No hay alumnos que requieran regularización en este grupo. Todos han aprobado o están pendientes de calificar."
                    />
                )
            ) : selectedGroup && isLoadingGroup ? (
                <div className="flex justify-center p-8">Cargando alumnos...</div>
            ) : (
                <EmptyState
                    icon={<BookOpen className="h-12 w-12 text-muted-foreground/50" />}
                    title="Selecciona un grupo"
                    description="Elige uno de tus grupos asignados para gestionar regularizaciones."
                />
            )}
        </div>
    )
}
