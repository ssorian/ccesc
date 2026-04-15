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
import { Search, Pencil, Trash2, Users, BookOpen } from "lucide-react"
import { GroupGradesReviewPanel } from "@/features/grades/components/GroupGradesReviewPanel"
import { getGroups } from "@/features/groups/services/group.service"
import { GroupType } from "@/lib/types"
import { CreateGroupDialog } from "@/features/groups/components/CreateGroupDialog"
import { EditGroupDialog } from "@/features/groups/components/EditGroupDialog"
import { DeleteGroupDialog } from "@/features/groups/components/DeleteGroupDialog"
import { ManageMembersDialog } from "@/features/groups/components/ManageMembersDialog"
import { CourseAssignmentsDialog } from "@/features/groups/components/CourseAssignmentsDialog"

const groupTypeLabels: Record<GroupType, { label: string; variant: "default" | "secondary" | "outline" }> = {
    CAREER_SEMESTER: { label: "Carrera/Semestre", variant: "default" },
    WORKSHOP: { label: "Taller", variant: "secondary" },
    INDIVIDUAL: { label: "Individual", variant: "outline" },
}

interface GroupListProps {
    initialData?: any
}

export function GroupList({ initialData }: GroupListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [periodFilter, setPeriodFilter] = useState<string>("all")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [editingGroup, setEditingGroup] = useState<any>(null)
    const [deletingGroup, setDeletingGroup] = useState<any>(null)
    const [managingMembersGroup, setManagingMembersGroup] = useState<any>(null)
    const [managingCoursesGroup, setManagingCoursesGroup] = useState<any>(null)

    const { data: groupsResult, isLoading } = useQuery({
        queryKey: ["groups", page, searchTerm, typeFilter, periodFilter],
        queryFn: () =>
            getGroups({
                skip: (page - 1) * pageSize,
                take: pageSize,
                search: searchTerm || undefined,
                groupType: typeFilter !== "all" ? (typeFilter as GroupType) : undefined,
                period: periodFilter !== "all" ? periodFilter : undefined,
            }),
        initialData: page === 1 && !searchTerm && typeFilter === "all" && periodFilter === "all" ? { success: true, data: initialData } : undefined,
    })

    const groups = (groupsResult?.success ? groupsResult.data : []) ?? []

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
                    <p className="text-muted-foreground">
                        Gestiona los grupos académicos y talleres.
                    </p>
                </div>
                <CreateGroupDialog />
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Busca y filtra grupos por diferentes criterios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(1)
                                }}
                            />
                        </div>
                        <Select
                            value={typeFilter}
                            onValueChange={(value) => {
                                setTypeFilter(value)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Tipo de Grupo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                <SelectItem value="CAREER_SEMESTER">Carrera/Semestre</SelectItem>
                                <SelectItem value="WORKSHOP">Taller</SelectItem>
                                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={periodFilter}
                            onValueChange={(value) => {
                                setPeriodFilter(value)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full md:w-[150px]">
                                <SelectValue placeholder="Periodo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="2024-1">2024-1</SelectItem>
                                <SelectItem value="2024-2">2024-2</SelectItem>
                                {/* Add more periods dynamically if needed */}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Groups Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Grupos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead>Periodo</TableHead>
                                <TableHead>Alumnos</TableHead>
                                <TableHead>Profesores</TableHead>
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
                            ) : groups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No se encontraron grupos con los filtros seleccionados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                groups.map((group: any) => (
                                    <TableRow key={group.id}>
                                        <TableCell className="font-medium">{group.name}</TableCell>
                                        <TableCell>
                                            {group.groupType === "CAREER_SEMESTER" ? (
                                                <div>
                                                    <Badge variant="default">Carrera/Semestre</Badge>
                                                    {group.career && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {group.career.name} • Sem. {group.semester}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge variant={groupTypeLabels[group.groupType as GroupType]?.variant || "default"}>
                                                    {groupTypeLabels[group.groupType as GroupType]?.label || group.groupType}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {group.course?.name || "N/A"}
                                        </TableCell>
                                        <TableCell>{group.period}</TableCell>
                                        <TableCell>{group._count?.students || 0}</TableCell>
                                        <TableCell>{group._count?.teachers || 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <GroupGradesReviewPanel
                                                    groupId={group.id}
                                                    groupName={group.name}
                                                />
                                                {group.groupType === "CAREER_SEMESTER" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Asignar Profesores por Materia"
                                                        onClick={() => setManagingCoursesGroup(group)}
                                                    >
                                                        <BookOpen className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Gestionar Miembros"
                                                    onClick={() => setManagingMembersGroup(group)}
                                                >
                                                    <Users className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingGroup(group)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeletingGroup(group)}
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
                    {groups.length > 0 && (
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
                                    disabled={groups.length < pageSize || isLoading}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            {editingGroup && (
                <EditGroupDialog
                    group={editingGroup}
                    open={!!editingGroup}
                    onOpenChange={(open) => !open && setEditingGroup(null)}
                />
            )}
            {deletingGroup && (
                <DeleteGroupDialog
                    group={deletingGroup}
                    open={!!deletingGroup}
                    onOpenChange={(open) => !open && setDeletingGroup(null)}
                />
            )}
            {managingMembersGroup && (
                <ManageMembersDialog
                    group={managingMembersGroup}
                    open={!!managingMembersGroup}
                    onOpenChange={(open) => !open && setManagingMembersGroup(null)}
                />
            )}
            {managingCoursesGroup && (
                <CourseAssignmentsDialog
                    group={managingCoursesGroup}
                    open={!!managingCoursesGroup}
                    onOpenChange={(open) => !open && setManagingCoursesGroup(null)}
                />
            )}
        </div>
    )
}
