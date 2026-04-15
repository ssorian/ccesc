"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateGroupSchema, type UpdateGroupInput } from "@/features/groups/types/schema"
import { updateGroup } from "@/features/groups/services/group.service"
import { getCourses } from "@/features/courses/services/course.service"
import { getCareers } from "@/features/careers/services/career.service"
import { GroupType } from "@/lib/types"

interface EditGroupDialogProps {
    group: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditGroupDialog({ group, open, onOpenChange }: EditGroupDialogProps) {
    const queryClient = useQueryClient()

    const { data: coursesResult } = useQuery({
        queryKey: ["courses"],
        queryFn: () => getCourses(),
    })

    const { data: careersResult } = useQuery({
        queryKey: ["careers"],
        queryFn: () => getCareers(),
    })

    const courses = Array.isArray(coursesResult) ? coursesResult : []
    const careers = Array.isArray(careersResult) ? careersResult : []

    const form = useForm<UpdateGroupInput>({
        resolver: zodResolver(updateGroupSchema),
        defaultValues: {
            name: group.name,
            period: group.period,
            groupType: group.groupType as GroupType,
            status: group.status || "ACTIVO",
            courseId: group.courseId,
            careerId: group.careerId,
            semester: group.semester,
        },
    })

    useEffect(() => {
        if (group) {
            form.reset({
                name: group.name,
                period: group.period,
                groupType: group.groupType as GroupType,
                status: group.status || "ACTIVO",
                courseId: group.courseId,
                careerId: group.careerId,
                semester: group.semester,
            })
        }
    }, [group, form])

    const mutation = useMutation({
        mutationFn: (data: UpdateGroupInput) => updateGroup({ id: group.id, ...data }),
        onSuccess: (result: any) => {
            if (result && !result.error) {
                queryClient.invalidateQueries({ queryKey: ["groups"] })
                toast.success("Grupo actualizado exitosamente")
                onOpenChange(false)
            } else {
                toast.error(result?.error || "Error al actualizar grupo")
            }
        },
        onError: () => {
            toast.error("Error al actualizar grupo")
        },
    })

    const onSubmit = (data: UpdateGroupInput) => {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Grupo</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del grupo. Los campos marcados con * son obligatorios.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="name">Nombre del Grupo *</FieldLabel>
                                <Input
                                    id="name"
                                    placeholder="ISC-1A"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <FieldError>{form.formState.errors.name.message}</FieldError>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="period">Periodo *</FieldLabel>
                                <Input
                                    id="period"
                                    placeholder="2024-1"
                                    {...form.register("period")}
                                />
                                {form.formState.errors.period && (
                                    <FieldError>{form.formState.errors.period.message}</FieldError>
                                )}
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="groupType">Tipo de Grupo *</FieldLabel>
                                <Select
                                    value={form.watch("groupType")}
                                    onValueChange={(value) => {
                                        form.setValue("groupType", value as GroupType);
                                        if (value === GroupType.CAREER_SEMESTER) {
                                            form.setValue("courseId", null);
                                            if (!form.watch("semester")) form.setValue("semester", 1);
                                        } else {
                                            form.setValue("careerId", null);
                                            form.setValue("semester", null);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="groupType">
                                        <SelectValue placeholder="Selecciona tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={GroupType.CAREER_SEMESTER}>Carrera/Semestre</SelectItem>
                                        <SelectItem value={GroupType.WORKSHOP}>Taller</SelectItem>
                                        <SelectItem value={GroupType.INDIVIDUAL}>Individual</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.groupType && (
                                    <FieldError>{form.formState.errors.groupType.message}</FieldError>
                                )}
                            </Field>
                            {form.watch("groupType") === GroupType.CAREER_SEMESTER ? (
                                <Field>
                                    <FieldLabel htmlFor="careerId">Carrera *</FieldLabel>
                                    <Select
                                        value={form.watch("careerId") || ""}
                                        onValueChange={(value) => form.setValue("careerId", value)}
                                    >
                                        <SelectTrigger id="careerId">
                                            <SelectValue placeholder="Selecciona una carrera" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {careers.map((career: any) => (
                                                <SelectItem key={career.id} value={career.id}>
                                                    {career.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.careerId && (
                                        <FieldError>{form.formState.errors.careerId.message}</FieldError>
                                    )}
                                </Field>
                            ) : (
                                <Field>
                                    <FieldLabel htmlFor="courseId">Curso Asociado *</FieldLabel>
                                    <Select
                                        value={form.watch("courseId") || ""}
                                        onValueChange={(value) => form.setValue("courseId", value)}
                                    >
                                        <SelectTrigger id="courseId">
                                            <SelectValue placeholder="Selecciona un curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course: any) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name} ({course.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.courseId && (
                                        <FieldError>{form.formState.errors.courseId.message}</FieldError>
                                    )}
                                </Field>
                            )}
                        </div>
                        {form.watch("groupType") === GroupType.CAREER_SEMESTER && (
                            <Field>
                                <FieldLabel htmlFor="semester">Semestre</FieldLabel>
                                <Select
                                    value={form.watch("semester")?.toString() || ""}
                                    onValueChange={(value) => form.setValue("semester", value ? parseInt(value) : null)}
                                >
                                    <SelectTrigger id="semester">
                                        <SelectValue placeholder="Selecciona semestre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
                                            <SelectItem key={sem} value={sem.toString()}>
                                                {sem}° Semestre
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.semester && (
                                    <FieldError>{form.formState.errors.semester.message}</FieldError>
                                )}
                            </Field>
                        )}
                    </FieldGroup>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={mutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Actualizando..." : "Actualizar Grupo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
