"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Pencil, Trash2 } from "lucide-react"
import { getTeachers } from "@/features/teachers/services/teacher.service"
import { TeacherStatus } from "@/lib/types"
import { CreateTeacherDialog } from "@/features/teachers/components/CreateTeacherDialog"
import { EditTeacherDialog } from "@/features/teachers/components/EditTeacherDialog"
import { DeleteTeacherDialog } from "@/features/teachers/components/DeleteTeacherDialog"

const statusLabels: Record<TeacherStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVO: { label: "Activo", variant: "default" },
    INACTIVO: { label: "Inactivo", variant: "secondary" },
}

const departments = [
    "Ingeniería",
    "Administración",
    "Ciencias Básicas",
    "Humanidades",
    "Posgrado",
]

interface TeacherListProps {
    initialData?: any
}

export function TeacherList({ initialData }: TeacherListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [departmentFilter, setDepartmentFilter] = useState<string>("all")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [editingTeacher, setEditingTeacher] = useState<any>(null)
    const [deletingTeacher, setDeletingTeacher] = useState<any>(null)

    const { data: teachersResult, isLoading } = useQuery({
        queryKey: ["teachers", page, searchTerm, statusFilter, departmentFilter],
        queryFn: () =>
            getTeachers({
                skip: (page - 1) * pageSize,
                take: pageSize,
                search: searchTerm || undefined,
                status: statusFilter !== "all" ? (statusFilter as TeacherStatus) : undefined,
                department: departmentFilter !== "all" ? departmentFilter : undefined,
            }),
        initialData: page === 1 && !searchTerm && statusFilter === "all" && departmentFilter === "all" ? { success: true, data: initialData } : undefined,
    })

    const teachers = (teachersResult?.success ? teachersResult.data : []) ?? []

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profesores</h1>
                    <p className="text-muted-foreground">
                        Gestiona el personal docente de la institución.
                    </p>
                </div>
                <CreateTeacherDialog />
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Busca y filtra profesores por diferentes criterios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, apellido o número de empleado..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(1)
                                }}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="ACTIVO">Activo</SelectItem>
                                <SelectItem value="INACTIVO">Inactivo</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={departmentFilter}
                            onValueChange={(value) => {
                                setDepartmentFilter(value)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los departamentos</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Teachers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Profesores</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Empleado</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Departamento</TableHead>
                                <TableHead>Grupos</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Cargando...
                                    </TableCell>
                                </TableRow>
                            ) : teachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No se encontraron profesores con los filtros seleccionados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teachers.map((teacher: any) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.employeeId}</TableCell>
                                        <TableCell>
                                            {teacher.user.name} {teacher.user.lastName}
                                        </TableCell>
                                        <TableCell>{teacher.user.email}</TableCell>
                                        <TableCell>{teacher.department}</TableCell>
                                        <TableCell>{teacher._count?.groupAssignments || 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusLabels[teacher.status as TeacherStatus]?.variant || "default"}>
                                                {statusLabels[teacher.status as TeacherStatus]?.label || teacher.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingTeacher(teacher)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeletingTeacher(teacher)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {teachers.length > 0 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Página {page}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1 || isLoading}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={teachers.length < pageSize || isLoading}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            {editingTeacher && (
                <EditTeacherDialog
                    teacher={editingTeacher}
                    open={!!editingTeacher}
                    onOpenChange={(open) => !open && setEditingTeacher(null)}
                />
            )}
            {deletingTeacher && (
                <DeleteTeacherDialog
                    teacher={deletingTeacher}
                    open={!!deletingTeacher}
                    onOpenChange={(open) => !open && setDeletingTeacher(null)}
                />
            )}
        </div>
    )
}
