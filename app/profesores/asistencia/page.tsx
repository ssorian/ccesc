"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useGetTeacherById } from "@/features/teachers/hooks/useGetTeacherById"
import { useGroup } from "@/features/groups/hooks/useGetGroupById"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CalendarDays } from "lucide-react"
import { GroupSelector } from "@/features/groups/components/GroupSelector"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatsCard } from "@/components/shared/StatsCard"

export default function AsistenciaPage() {
    const { data: session } = useSession()
    const [selectedGroup, setSelectedGroup] = useState<string>("")
    const [students, setStudents] = useState<any[]>([])

    const { data: teacher, isLoading: isLoadingTeacher } = useGetTeacherById({
        id: session?.user?.id || "",
    })

    const { data: groupData, isLoading: isLoadingGroup } = useGroup({
        id: selectedGroup,
    })

    const units = groupData?.course?.unitsList || []

    useEffect(() => {
        if (groupData?.members) {
            const mappedStudents = groupData.members.map((member: any) => member.student)
            setStudents(mappedStudents)
        }
    }, [groupData])

    // Calculate attendance statistics
    const totalStudents = students.length
    const studentsWithAttendance = students.filter(s => {
        const enrollment = s.enrollments?.[0]
        return enrollment?.attendances && enrollment.attendances.length > 0
    })

    const calculateAttendanceRate = (student: any) => {
        const enrollment = student.enrollments?.[0]
        if (!enrollment?.attendances || enrollment.attendances.length === 0) return 0

        const presentCount = enrollment.attendances.filter((a: any) => a.present).length
        return (presentCount / enrollment.attendances.length) * 100
    }

    const avgAttendanceRate = studentsWithAttendance.length > 0
        ? (studentsWithAttendance.reduce((sum, s) => sum + calculateAttendanceRate(s), 0) / studentsWithAttendance.length).toFixed(1)
        : "0"

    if (isLoadingTeacher) {
        return <div className="p-6">Cargando información...</div>
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Listas de Asistencia</h1>
                <p className="text-muted-foreground">
                    Consulta los registros de asistencia de tus grupos.
                </p>
            </div>

            {/* Group Selector */}
            <GroupSelector
                groups={teacher?.groupAssignments || []}
                selectedGroupId={selectedGroup}
                onGroupSelect={setSelectedGroup}
            />

            {/* Attendance Content */}
            {selectedGroup && groupData ? (
                <>
                    {/* Statistics */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard
                            title="Total de Alumnos"
                            value={totalStudents}
                            icon={Users}
                            description={`${groupData.name} - ${groupData.period}`}
                        />
                        <StatsCard
                            title="Asistencia Promedio"
                            value={`${avgAttendanceRate}%`}
                            icon={CalendarDays}
                            description="Promedio del grupo"
                        />
                        <StatsCard
                            title="Con Registros"
                            value={studentsWithAttendance.length}
                            icon={CalendarDays}
                            description={`${totalStudents - studentsWithAttendance.length} sin registros`}
                        />
                    </div>

                    {/* Attendance Tabs by Unit */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Asistencias</CardTitle>
                            <CardDescription>
                                Visualiza el historial de asistencias por unidad (solo lectura)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="general">General</TabsTrigger>
                                    {units.map((unit: any) => (
                                        <TabsTrigger key={unit.id} value={`unit${unit.unitNumber}`}>
                                            Unidad {unit.unitNumber}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {/* General Tab */}
                                <TabsContent value="general">
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Matrícula</TableHead>
                                                    <TableHead>Nombre</TableHead>
                                                    <TableHead className="text-center">Total Asistencias</TableHead>
                                                    <TableHead className="text-center">Presentes</TableHead>
                                                    <TableHead className="text-center">Ausentes</TableHead>
                                                    <TableHead className="text-center">% Asistencia</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {students.map((student) => {
                                                    const enrollment = student.enrollments?.[0]
                                                    const attendances = enrollment?.attendances || []
                                                    const presentCount = attendances.filter((a: any) => a.present).length
                                                    const absentCount = attendances.length - presentCount
                                                    const attendanceRate = attendances.length > 0
                                                        ? ((presentCount / attendances.length) * 100).toFixed(1)
                                                        : "0"

                                                    return (
                                                        <TableRow key={student.id}>
                                                            <TableCell className="font-medium">{student.matricula}</TableCell>
                                                            <TableCell>{student.user.name} {student.user.lastName}</TableCell>
                                                            <TableCell className="text-center">{attendances.length}</TableCell>
                                                            <TableCell className="text-center text-green-600 font-semibold">
                                                                {presentCount}
                                                            </TableCell>
                                                            <TableCell className="text-center text-red-600 font-semibold">
                                                                {absentCount}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge
                                                                    variant={
                                                                        parseFloat(attendanceRate) >= 80
                                                                            ? "default"
                                                                            : parseFloat(attendanceRate) >= 60
                                                                                ? "secondary"
                                                                                : "destructive"
                                                                    }
                                                                >
                                                                    {attendanceRate}%
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                {/* Unit Tabs */}
                                {units.map((unit: any) => (
                                    <TabsContent key={unit.id} value={`unit${unit.unitNumber}`}>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold">{unit.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Unidad {unit.unitNumber}
                                            </p>
                                        </div>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[100px]">Matrícula</TableHead>
                                                        <TableHead>Nombre</TableHead>
                                                        <TableHead className="text-center">Asistencias</TableHead>
                                                        <TableHead className="text-center">% Asistencia</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {students.map((student) => {
                                                        const enrollment = student.enrollments?.[0]
                                                        // Filter attendances for this unit (if unit info available in attendance records)
                                                        const attendances = enrollment?.attendances || []
                                                        const presentCount = attendances.filter((a: any) => a.present).length
                                                        const attendanceRate = attendances.length > 0
                                                            ? ((presentCount / attendances.length) * 100).toFixed(1)
                                                            : "0"

                                                        return (
                                                            <TableRow key={student.id}>
                                                                <TableCell className="font-medium">{student.matricula}</TableCell>
                                                                <TableCell>{student.user.name} {student.user.lastName}</TableCell>
                                                                <TableCell className="text-center">
                                                                    {presentCount} / {attendances.length}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge
                                                                        variant={
                                                                            parseFloat(attendanceRate) >= 80
                                                                                ? "default"
                                                                                : parseFloat(attendanceRate) >= 60
                                                                                    ? "secondary"
                                                                                    : "destructive"
                                                                        }
                                                                    >
                                                                        {attendanceRate}%
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </>
            ) : selectedGroup && isLoadingGroup ? (
                <div className="flex justify-center p-8">Cargando asistencias...</div>
            ) : (
                <EmptyState
                    icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
                    title="Selecciona un grupo"
                    description="Elige uno de tus grupos asignados para ver las listas de asistencia."
                />
            )}
        </div>
    )
}
