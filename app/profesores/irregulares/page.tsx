"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useGetTeacherById } from "@/features/teachers/hooks/useGetTeacherById"
import { useGroup } from "@/features/groups/hooks/useGetGroupById"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Search } from "lucide-react"
import { GroupSelector } from "@/features/groups/components/GroupSelector"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatsCard } from "@/components/shared/StatsCard"

export default function IrregularesPage() {
    const { data: session } = useSession()
    const [selectedGroup, setSelectedGroup] = useState<string>("")
    const [students, setStudents] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    const { data: teacher, isLoading: isLoadingTeacher } = useGetTeacherById({
        id: session?.user?.id || "",
    })

    const { data: groupData, isLoading: isLoadingGroup } = useGroup({
        id: selectedGroup,
    })

    useEffect(() => {
        if (groupData?.members) {
            const mappedStudents = groupData.members
                .map((member: any) => member.student)
                .filter((student: any) => {
                    // Filter irregular students
                    if (student.status !== "REGULAR") return true

                    const enrollment = student.enrollments?.[0]
                    if (!enrollment) return false

                    // Check for failing grades
                    const hasFailingGrade = enrollment.unitGrades?.some((ug: any) =>
                        ug.grade !== null && ug.grade < 6
                    )
                    const finalGrade = enrollment.finalGrade
                    const isFailing = finalGrade !== null && finalGrade < 6

                    // Check attendance (if available)
                    const lowAttendance = enrollment.attendances?.length > 0 &&
                        enrollment.attendances.filter((a: any) => a.present).length / enrollment.attendances.length < 0.8

                    return hasFailingGrade || isFailing || lowAttendance
                })
            setStudents(mappedStudents)
        }
    }, [groupData])

    const filteredStudents = students.filter(student => {
        const fullName = `${student.user.name} ${student.user.lastName}`.toLowerCase()
        const matricula = student.matricula.toLowerCase()
        const search = searchTerm.toLowerCase()
        return fullName.includes(search) || matricula.includes(search)
    })

    const getIrregularReason = (student: any) => {
        const reasons = []

        if (student.status !== "REGULAR") {
            reasons.push(`Estatus: ${student.status}`)
        }

        const enrollment = student.enrollments?.[0]
        if (enrollment) {
            const finalGrade = enrollment.finalGrade
            if (finalGrade !== null && finalGrade < 6) {
                reasons.push(`Calificación final: ${finalGrade.toFixed(1)}`)
            }

            const failingUnits = enrollment.unitGrades?.filter((ug: any) =>
                ug.grade !== null && ug.grade < 6
            ) || []
            if (failingUnits.length > 0) {
                reasons.push(`${failingUnits.length} unidad(es) reprobada(s)`)
            }
        }

        return reasons.length > 0 ? reasons.join(" • ") : "Sin especificar"
    }

    if (isLoadingTeacher) {
        return <div className="p-6">Cargando información...</div>
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Alumnos Irregulares</h1>
                <p className="text-muted-foreground">
                    Consulta alumnos con situación académica irregular.
                </p>
            </div>

            {/* Group Selector */}
            <GroupSelector
                groups={teacher?.groupAssignments || []}
                selectedGroupId={selectedGroup}
                onGroupSelect={setSelectedGroup}
            />

            {/* Irregular Students Content */}
            {selectedGroup && groupData ? (
                <>
                    {/* Statistics */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard
                            title="Alumnos Irregulares"
                            value={students.length}
                            icon={AlertTriangle}
                            description="Requieren atención especial"
                        />
                        <StatsCard
                            title="Total en el Grupo"
                            value={groupData.members?.length || 0}
                            icon={Search}
                            description={`${((students.length / (groupData.members?.length || 1)) * 100).toFixed(1)}% irregulares`}
                        />
                        <StatsCard
                            title="Periodo"
                            value={groupData.period}
                            icon={AlertTriangle}
                            description={groupData.name}
                        />
                    </div>

                    {students.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Alumnos Irregulares</CardTitle>
                                <CardDescription>
                                    Alumnos con bajo rendimiento, baja asistencia o estatus irregular
                                </CardDescription>
                                <div className="relative mt-4">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre o matrícula..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Matrícula</TableHead>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead className="text-center">Calificación</TableHead>
                                                <TableHead>Motivo de Irregularidad</TableHead>
                                                <TableHead className="text-center">Estatus</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStudents.map((student) => {
                                                const enrollment = student.enrollments?.[0]
                                                const finalGrade = enrollment?.finalGrade

                                                return (
                                                    <TableRow key={student.id}>
                                                        <TableCell className="font-medium">{student.matricula}</TableCell>
                                                        <TableCell>{student.user.name} {student.user.lastName}</TableCell>
                                                        <TableCell className="text-center">
                                                            {finalGrade !== null && finalGrade !== undefined ? (
                                                                <span className={finalGrade >= 6 ? "text-green-600" : "text-red-600 font-semibold"}>
                                                                    {finalGrade.toFixed(1)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {getIrregularReason(student)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                variant={student.status === "REGULAR" ? "default" : "destructive"}
                                                            >
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
                            icon={<AlertTriangle className="h-12 w-12 text-muted-foreground/50" />}
                            title="¡Excelente!"
                            description="No hay alumnos irregulares en este grupo. Todos están al corriente."
                        />
                    )}
                </>
            ) : selectedGroup && isLoadingGroup ? (
                <div className="flex justify-center p-8">Cargando alumnos...</div>
            ) : (
                <EmptyState
                    icon={<AlertTriangle className="h-12 w-12 text-muted-foreground/50" />}
                    title="Selecciona un grupo"
                    description="Elige uno de tus grupos asignados para ver alumnos irregulares."
                />
            )}
        </div>
    )
}
