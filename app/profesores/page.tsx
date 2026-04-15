"use client"

import { useSession } from "@/lib/auth-client"
import { useGetTeacherById } from "@/features/teachers/hooks/useGetTeacherById"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, BookOpen, AlertTriangle } from "lucide-react"
import { StatsCard } from "@/components/shared/StatsCard"

export default function TeacherPage() {
    const { data: session } = useSession()
    const { data: teacher, isLoading } = useGetTeacherById({
        id: session?.user?.id || "",
    })

    if (isLoading) {
        return <div className="p-6">Cargando información...</div>
    }

    const totalGroups = teacher?.groupAssignments?.length || 0
    const activeGroups = teacher?.groupAssignments?.filter((ga: any) =>
        ga.group.status === "ACTIVO"
    ).length || 0

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Bienvenido, Prof. {teacher?.user.name} {teacher?.user.lastName}
                </h1>
                <p className="text-muted-foreground">
                    Resumen de tu actividad docente
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Grupos Activos"
                    value={activeGroups}
                    icon={Users}
                    description={`${totalGroups} grupos totales`}
                />
                <StatsCard
                    title="ID de Empleado"
                    value={teacher?.employeeId || "N/A"}
                    icon={ClipboardList}
                    description="Identificador único"
                />
                <StatsCard
                    title="Departamento"
                    value={teacher?.department || "N/A"}
                    icon={BookOpen}
                    description="Área de enseñanza"
                />
                <StatsCard
                    title="Estatus"
                    value={teacher?.status || "N/A"}
                    icon={AlertTriangle}
                    description="Estado actual"
                />
            </div>

            {/* Groups List */}
            <Card>
                <CardHeader>
                    <CardTitle>Tus Grupos Asignados</CardTitle>
                    <CardDescription>
                        Grupos que tienes asignados para el periodo actual
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {teacher?.groupAssignments && teacher.groupAssignments.length > 0 ? (
                            teacher.groupAssignments.map((assignment: any) => (
                                <div
                                    key={assignment.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {assignment.group.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {assignment.group.course.name} ({assignment.group.course.code})
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Periodo: {assignment.group.period} • {assignment.group._count?.members || 0} alumnos
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${assignment.group.status === "ACTIVO"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {assignment.group.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No tienes grupos asignados actualmente.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Acceso Rápido</CardTitle>
                    <CardDescription>
                        Accede a las funciones principales desde el menú lateral
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-2">
                    <a
                        href="/profesores/calificaciones"
                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Calificaciones</p>
                            <p className="text-xs text-muted-foreground">Captura y gestión</p>
                        </div>
                    </a>
                    <a
                        href="/profesores/asistencia"
                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Asistencias</p>
                            <p className="text-xs text-muted-foreground">Listas y registros</p>
                        </div>
                    </a>
                </CardContent>
            </Card>
        </div>
    )
}

