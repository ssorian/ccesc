"use client"

import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { useGetTeacherById } from "@/features/teachers/hooks/useGetTeacherById"
import { useGroup } from "@/features/groups/hooks/useGetGroupById"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import { GroupSelector } from "@/features/groups/components/GroupSelector"
import { UnitGradingTable } from "@/features/grades/components/UnitGradingTable"
import { getEvaluationPeriods } from "@/features/evaluation-periods/actions/evaluation-period.actions"
import { EvaluationPeriodStatus } from "@/lib/types"

const periodStatusBadge: Record<EvaluationPeriodStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    SCHEDULED: { label: "Programado", variant: "outline" },
    OPEN: { label: "Abierto", variant: "default" },
    CLOSED: { label: "Cerrado", variant: "secondary" },
}

export default function TeacherGradingPage() {
    const { data: session } = useSession()
    const [selectedGroup, setSelectedGroup] = useState<string>("")

    const { data: teacher, isLoading: isLoadingTeacher } = useGetTeacherById({
        id: session?.user?.id || "",
    })

    const { data: groupData, isLoading: isLoadingGroup } = useGroup({
        id: selectedGroup,
    })

    const institutionId: string = (groupData as any)?.institution?.id ?? ""
    const schoolYearId: string = (groupData as any)?.schoolYear?.id ?? ""

    const { data: periodsResult } = useQuery({
        queryKey: ["evaluation-periods", institutionId, schoolYearId],
        queryFn: () => getEvaluationPeriods({ institutionId, schoolYearId }),
        enabled: !!institutionId && !!schoolYearId,
    })

    const periods: any[] = (periodsResult as any) ?? []

    // Resuelve el período ordinario para una unidad por convención: evaluationNumber == unitNumber
    const getPeriodForUnit = (unitNumber: number) =>
        periods.find((p) => p.evaluationNumber === unitNumber && !p.isExtraordinary) ?? null

    // authAction returns data directly — no .success/.data wrapper
    const units: any[] = (groupData as any)?.groupCourses?.[0]?.course?.units ?? []
    const teacherGroupAssignments: any[] = (teacher as any)?.teacherGroups ?? []

    // Todos los alumnos del grupo se muestran aunque aún no tengan calificación
    const buildRows = (unitId: string) => {
        const studentGroups: any[] = (groupData as any)?.studentGroups ?? []
        return studentGroups.flatMap((sg: any) => {
            const student = sg.student
            const enrollment = student.enrollments?.[0]
            if (!enrollment) return []
            const unitGrade = enrollment.unitGrades?.find((ug: any) => ug.unit?.id === unitId)
            // Mostrar el alumno aunque no tenga calificación (grade null = sin capturar)
            if (!unitGrade) return []
            return [{
                studentId: student.id,
                matricula: student.matricula,
                name: student.user.name,
                lastName: student.user.lastName,
                status: student.status ?? "REGULAR",
                enrollmentId: enrollment.id,
                unitGradeId: unitGrade.id,
                grade: unitGrade.grade ?? null,
                version: unitGrade.version ?? 0,
                unitId: unitGrade.unitId,
            }]
        })
    }

    if (isLoadingTeacher) {
        return <div className="p-6">Cargando información del profesor...</div>
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Calificaciones por Grupo</h1>
                <p className="text-muted-foreground">
                    Ingresa las calificaciones de tus grupos. Los cambios se guardan automáticamente por celda.
                </p>
            </div>

            <GroupSelector
                groups={teacherGroupAssignments}
                selectedGroupId={selectedGroup}
                onGroupSelect={setSelectedGroup}
            />

            {selectedGroup && groupData ? (
                <>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-3">
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">Grupo</span>
                            <span className="text-sm font-medium">{(groupData as any)?.name}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">Curso</span>
                            <span className="text-sm font-medium">
                                {(groupData as any)?.groupCourses?.[0]?.course?.name ?? "—"}
                            </span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">Período</span>
                            <span className="text-sm font-medium">{(groupData as any)?.period ?? "—"}</span>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Captura de Calificaciones</CardTitle>
                            <CardDescription>
                                Modifica el valor en la celda y presiona Enter o haz clic fuera para guardar.
                                Los conflictos de versión se señalan en rojo — recarga la celda afectada antes de reingresar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs
                                defaultValue={units.length > 0 ? units[0].id : ""}
                                className="w-full"
                            >
                                <TabsList className="mb-4 flex flex-wrap h-auto">
                                    {units.map((unit: any) => {
                                        const period = getPeriodForUnit(unit.unitNumber)
                                        const statusInfo = period ? periodStatusBadge[period.status as EvaluationPeriodStatus] : null
                                        return (
                                            <TabsTrigger key={unit.id} value={unit.id} className="flex items-center gap-2">
                                                Unidad {unit.unitNumber}
                                                {statusInfo && (
                                                    <Badge variant={statusInfo.variant} className="text-xs px-1.5 py-0">
                                                        {statusInfo.label}
                                                    </Badge>
                                                )}
                                            </TabsTrigger>
                                        )
                                    })}
                                </TabsList>

                                {units.map((unit: any) => {
                                    const period = getPeriodForUnit(unit.unitNumber)
                                    const periodStatus = period?.status ?? null
                                    return (
                                        <TabsContent key={unit.id} value={unit.id}>
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold">{unit.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Unidad {unit.unitNumber} · Período de evaluación N°{unit.unitNumber}
                                                    {period && (
                                                        <span className="ml-2">
                                                            <Badge variant={periodStatusBadge[period.status as EvaluationPeriodStatus]?.variant ?? "outline"} className="text-xs">
                                                                {periodStatusBadge[period.status as EvaluationPeriodStatus]?.label ?? period.status}
                                                            </Badge>
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <UnitGradingTable
                                                rows={buildRows(unit.id)}
                                                unitNumber={unit.unitNumber}
                                                groupId={selectedGroup}
                                                periodStatus={periodStatus}
                                            />
                                        </TabsContent>
                                    )
                                })}
                            </Tabs>
                        </CardContent>
                    </Card>
                </>
            ) : selectedGroup && isLoadingGroup ? (
                <div className="flex justify-center p-8">Cargando alumnos...</div>
            ) : (
                !selectedGroup && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">Selecciona un grupo</h3>
                            <p className="text-muted-foreground max-w-md">
                                Elige uno de tus grupos asignados para comenzar a capturar calificaciones.
                            </p>
                        </CardContent>
                    </Card>
                )
            )}
        </div>
    )
}
