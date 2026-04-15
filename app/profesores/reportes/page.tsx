"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useGetTeacherById } from "@/features/teachers/hooks/useGetTeacherById"
import { useGroup } from "@/features/groups/hooks/useGetGroupById"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, TrendingUp, TrendingDown } from "lucide-react"
import { GroupSelector } from "@/features/groups/components/GroupSelector"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatsCard } from "@/components/shared/StatsCard"
import { AllUnitsTable } from "@/features/grades/components/AllUnitsTable"

export default function ReportesPage() {
    const { data: session } = useSession()
    const [selectedGroup, setSelectedGroup] = useState<string>("")
    const [students, setStudents] = useState<any[]>([])

    const { data: teacher, isLoading: isLoadingTeacher } = useGetTeacherById({
        id: session?.user?.id || "",
    })

    const { data: groupData, isLoading: isLoadingGroup } = useGroup({
        id: selectedGroup,
    })

    useEffect(() => {
        if (groupData?.members) {
            const mappedStudents = groupData.members.map((member: any) => member.student)
            setStudents(mappedStudents)
        }
    }, [groupData])

    const units = groupData?.course?.unitsList || []

    // Calculate statistics
    const totalStudents = students.length
    const studentsWithGrades = students.filter(s => {
        const enrollment = s.enrollments?.[0]
        return enrollment?.finalGrade !== null && enrollment?.finalGrade !== undefined
    })
    const passedStudents = studentsWithGrades.filter(s => s.enrollments?.[0]?.finalGrade >= 6)
    const failedStudents = studentsWithGrades.filter(s => s.enrollments?.[0]?.finalGrade < 6)
    const passRate = studentsWithGrades.length > 0
        ? ((passedStudents.length / studentsWithGrades.length) * 100).toFixed(1)
        : "0"

    const averageGrade = studentsWithGrades.length > 0
        ? (studentsWithGrades.reduce((sum, s) => sum + (s.enrollments?.[0]?.finalGrade || 0), 0) / studentsWithGrades.length).toFixed(2)
        : "N/A"

    if (isLoadingTeacher) {
        return <div className="p-6">Cargando información...</div>
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reporte de Calificaciones</h1>
                    <p className="text-muted-foreground">
                        Visualiza estadísticas y reportes de calificaciones por grupo.
                    </p>
                </div>
                {selectedGroup && groupData && (
                    <Button variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        Imprimir Reporte
                    </Button>
                )}
            </div>

            {/* Group Selector */}
            <GroupSelector
                groups={teacher?.groupAssignments || []}
                selectedGroupId={selectedGroup}
                onGroupSelect={setSelectedGroup}
            />

            {/* Report Content */}
            {selectedGroup && groupData ? (
                <>
                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total de Alumnos"
                            value={totalStudents}
                            icon={Users}
                            description={`${groupData.name} - ${groupData.period}`}
                        />
                        <StatsCard
                            title="Promedio General"
                            value={averageGrade}
                            icon={TrendingUp}
                            description="Calificación promedio del grupo"
                        />
                        <StatsCard
                            title="Índice de Aprobación"
                            value={`${passRate}%`}
                            icon={TrendingUp}
                            description={`${passedStudents.length} de ${studentsWithGrades.length} aprobados`}
                        />
                        <StatsCard
                            title="Alumnos Reprobados"
                            value={failedStudents.length}
                            icon={TrendingDown}
                            description={`${((failedStudents.length / (studentsWithGrades.length || 1)) * 100).toFixed(1)}% del total`}
                        />
                    </div>

                    {/* Detailed Report Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reporte Detallado de Calificaciones</CardTitle>
                            <CardDescription>
                                Calificaciones por unidad y promedios finales - {groupData.course.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AllUnitsTable students={students} units={units} />
                        </CardContent>
                    </Card>
                </>
            ) : selectedGroup && isLoadingGroup ? (
                <div className="flex justify-center p-8">Cargando reporte...</div>
            ) : (
                <EmptyState
                    icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
                    title="Selecciona un grupo"
                    description="Elige uno de tus grupos asignados para ver el reporte de calificaciones."
                />
            )}
        </div>
    )
}
