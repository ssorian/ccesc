"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, UserMinus, Search } from "lucide-react"
import { getGroupById } from "@/features/groups/services/group.service"
import { addStudentToGroup as addStudent } from "@/features/groups/services/group.service"
import { removeStudentFromGroup as removeStudent } from "@/features/groups/services/group.service"
import { assignTeacherToCourse as assignTeacher } from "@/features/groups/services/group.service"
import { getStudents } from "@/features/students/services/student.service"
import { getTeachers } from "@/features/teachers/services/teacher.service"

interface ManageMembersDialogProps {
    group: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ManageMembersDialog({ group, open, onOpenChange }: ManageMembersDialogProps) {
    const queryClient = useQueryClient()
    const [studentSearch, setStudentSearch] = useState("")
    const [teacherSearch, setTeacherSearch] = useState("")

    // Fetch current group details (members)
    const { data: groupDetailsResult } = useQuery({
        queryKey: ["group", group.id],
        queryFn: () => getGroupById({ id: group.id }),
        enabled: open,
    })

    // Fetch available students for search
    const { data: studentsResult } = useQuery({
        queryKey: ["students", "search", studentSearch],
        queryFn: () => getStudents({ skip: 0, take: 10, search: studentSearch }),
        enabled: studentSearch.length > 2,
    })

    // Fetch available teachers for search
    const { data: teachersResult } = useQuery({
        queryKey: ["teachers", "search", teacherSearch],
        queryFn: () => getTeachers({ skip: 0, take: 10, search: teacherSearch }),
        enabled: teacherSearch.length > 2,
    })

    const groupDetails: any = groupDetailsResult?.success ? groupDetailsResult.data : null
    const searchStudents: any[] = studentsResult?.success ? (studentsResult.data as any[]) : []
    const searchTeachers: any[] = teachersResult?.success ? (teachersResult.data as any[]) : []

    // Mutations
    const addStudentMutation = useMutation({
        mutationFn: addStudent,
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Alumno agregado al grupo")
                queryClient.invalidateQueries({ queryKey: ["group", group.id] })
                queryClient.invalidateQueries({ queryKey: ["groups"] }) // Update counts
            } else {
                toast.error(result.error || "Error al agregar alumno")
            }
        },
    })

    const removeStudentMutation = useMutation({
        mutationFn: removeStudent,
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Alumno removido del grupo")
                queryClient.invalidateQueries({ queryKey: ["group", group.id] })
                queryClient.invalidateQueries({ queryKey: ["groups"] }) // Update counts
            } else {
                toast.error(result.error || "Error al remover alumno")
            }
        },
    })

    const assignTeacherMutation = useMutation({
        mutationFn: assignTeacher,
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Profesor asignado al grupo")
                queryClient.invalidateQueries({ queryKey: ["group", group.id] })
                queryClient.invalidateQueries({ queryKey: ["groups"] }) // Update counts
            } else {
                toast.error(result.error || "Error al asignar profesor")
            }
        },
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Gestionar Miembros - {group.name}</DialogTitle>
                    <DialogDescription>
                        Agrega o elimina alumnos y profesores del grupo.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="students" className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="students">Alumnos</TabsTrigger>
                        <TabsTrigger value="teachers">Profesores</TabsTrigger>
                    </TabsList>

                    {/* STUDENTS TAB */}
                    <TabsContent value="students" className="flex-1 flex flex-col overflow-hidden gap-4">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {/* Current Members */}
                            <div className="flex flex-col border rounded-md p-4">
                                <h3 className="font-semibold mb-2">Miembros Actuales</h3>
                                <ScrollArea className="flex-1 h-[300px]">
                                    {groupDetails?.members.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No hay alumnos en este grupo.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {groupDetails?.members.map((member: any) => (
                                                <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                                    <div className="text-sm">
                                                        <p className="font-medium">{member.student.user.name} {member.student.user.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">{member.student.matricula}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive h-8 w-8"
                                                        onClick={() => removeStudentMutation.mutate({ groupId: group.id, studentId: member.studentId })}
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {/* Add Members */}
                            <div className="flex flex-col border rounded-md p-4">
                                <h3 className="font-semibold mb-2">Agregar Alumno</h3>
                                <div className="relative mb-4">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre o matrícula..."
                                        className="pl-8"
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                    />
                                </div>
                                <ScrollArea className="flex-1 h-[250px]">
                                    {studentSearch.length <= 2 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Escribe al menos 3 caracteres para buscar.
                                        </p>
                                    ) : searchStudents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No se encontraron alumnos.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {searchStudents.map((student: any) => {
                                                const isMember = groupDetails?.members.some((m: any) => m.studentId === student.id)
                                                return (
                                                    <div key={student.id} className="flex items-center justify-between p-2 border rounded-md">
                                                        <div className="text-sm">
                                                            <p className="font-medium">{student.user.name} {student.user.lastName}</p>
                                                            <p className="text-xs text-muted-foreground">{student.matricula}</p>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-8 w-8"
                                                            disabled={isMember}
                                                            onClick={() => addStudentMutation.mutate({ groupId: group.id, studentId: student.id })}
                                                        >
                                                            {isMember ? <span className="text-xs">✓</span> : <UserPlus className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TEACHERS TAB */}
                    <TabsContent value="teachers" className="flex-1 flex flex-col overflow-hidden gap-4">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {/* Current Teachers */}
                            <div className="flex flex-col border rounded-md p-4">
                                <h3 className="font-semibold mb-2">Profesores Asignados</h3>
                                <ScrollArea className="flex-1 h-[300px]">
                                    {groupDetails?.teacherAssignments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No hay profesores asignados.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {groupDetails?.teacherAssignments.map((assignment: any) => (
                                                <div key={assignment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                                    <div className="text-sm">
                                                        <p className="font-medium">{assignment.teacher.user.name} {assignment.teacher.user.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">{assignment.teacher.employeeId}</p>
                                                    </div>
                                                    {/* Removing teachers is typically handled by unassigning, not implemented yet but can be added */}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {/* Assign Teachers */}
                            <div className="flex flex-col border rounded-md p-4">
                                <h3 className="font-semibold mb-2">Asignar Profesor</h3>
                                <div className="relative mb-4">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre o nómina..."
                                        className="pl-8"
                                        value={teacherSearch}
                                        onChange={(e) => setTeacherSearch(e.target.value)}
                                    />
                                </div>
                                <ScrollArea className="flex-1 h-[250px]">
                                    {teacherSearch.length <= 2 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Escribe al menos 3 caracteres para buscar.
                                        </p>
                                    ) : searchTeachers.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No se encontraron profesores.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {searchTeachers.map((teacher: any) => {
                                                const isAssigned = groupDetails?.teacherAssignments.some((t: any) => t.teacherId === teacher.id)
                                                return (
                                                    <div key={teacher.id} className="flex items-center justify-between p-2 border rounded-md">
                                                        <div className="text-sm">
                                                            <p className="font-medium">{teacher.user.name} {teacher.user.lastName}</p>
                                                            <p className="text-xs text-muted-foreground">{teacher.employeeId}</p>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-8 w-8"
                                                            disabled={isAssigned}
                                                            onClick={() => assignTeacherMutation.mutate({ groupId: group.id, teacherId: teacher.id, role: "TITULAR" })}
                                                        >
                                                            {isAssigned ? <span className="text-xs">✓</span> : <UserPlus className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
