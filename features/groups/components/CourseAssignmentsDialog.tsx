"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { useCourseAssignments } from "@/features/groups/hooks/useCourseAssignments";
import { useAssignTeacherToCourse } from "@/features/groups/hooks/useAssignTeacherToCourse";
import { useRemoveTeacherFromCourse } from "@/features/groups/hooks/useRemoveTeacherFromCourse";
import { getTeachers } from "@/features/teachers/services/teacher.service";

interface CourseAssignmentsDialogProps {
    group: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CourseAssignmentsDialog({
    group,
    open,
    onOpenChange,
}: CourseAssignmentsDialogProps) {
    // Fetch course assignments
    const { data: assignmentsResult, isLoading: isLoadingAssignments } =
        useCourseAssignments(group.id, open && group.groupType === "CAREER_SEMESTER");

    // Fetch available teachers
    const { data: teachersResult, isLoading: isLoadingTeachers } = useQuery({
        queryKey: ["teachers"],
        queryFn: () => getTeachers(),
        enabled: open,
    });

    const assignMutation = useAssignTeacherToCourse();
    const removeMutation = useRemoveTeacherFromCourse(group.id);

    const assignments: any[] = assignmentsResult?.success ? assignmentsResult.data : [];
    const teachers = Array.isArray(teachersResult) ? teachersResult : [];

    if (group.groupType !== "CAREER_SEMESTER") {
        return null;
    }

    const handleAssign = (teacherId: string, courseId: string) => {
        assignMutation.mutate({
            groupId: group.id,
            teacherId,
            courseId,
        });
    };

    const handleRemove = (assignmentId: string) => {
        if (confirm("¿Estás seguro de remover este profesor de la materia?")) {
            removeMutation.mutate({ assignmentId });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Asignar Profesores por Materia</DialogTitle>
                    <DialogDescription>
                        {group.name} • {group.career?.name} • Semestre {group.semester}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {isLoadingAssignments ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Cargando materias...</span>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No hay materias disponibles para este semestre.</p>
                            <p className="text-sm mt-2">
                                Verifica que existan cursos para la carrera {group.career?.name} en el semestre {group.semester}.
                            </p>
                        </div>
                    ) : (
                        assignments.map((item: any) => (
                            <div
                                key={item.course.id}
                                className="flex items-start justify-between gap-4 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium truncate">{item.course.name}</h4>
                                        <Badge variant="outline" className="shrink-0">
                                            {item.course.code}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {item.course.credits} créditos • {item.course.hours} horas
                                    </p>
                                    {item.course.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {item.course.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {item.teacher ? (
                                        <>
                                            <Badge className="whitespace-nowrap">
                                                {item.teacher.user.name} {item.teacher.user.lastName}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemove(item.assignmentId)}
                                                disabled={removeMutation.isPending}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Select
                                            onValueChange={(teacherId) => handleAssign(teacherId, item.course.id)}
                                            disabled={assignMutation.isPending || isLoadingTeachers}
                                        >
                                            <SelectTrigger className="w-[250px]">
                                                <SelectValue placeholder="Seleccionar profesor..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isLoadingTeachers ? (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        Cargando...
                                                    </div>
                                                ) : teachers.length === 0 ? (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        No hay profesores disponibles
                                                    </div>
                                                ) : (
                                                    teachers.map((teacher: any) => (
                                                        <SelectItem key={teacher.id} value={teacher.id}>
                                                            {teacher.user.name} {teacher.user.lastName} ({teacher.employeeId})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {assignments.length > 0 && (
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                {assignments.filter((a: any) => a.teacher).length} de {assignments.length} materias
                                con profesor asignado
                            </span>
                            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
