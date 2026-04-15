"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus } from "lucide-react"
import { createGroupSchema, type CreateGroupInput } from "@/features/groups/types/schema"
import { createGroup } from "@/features/groups/services/group.service"
import { getCourses } from "@/features/courses/services/course.service"
import { getCareers } from "@/features/careers/services/career.service"
import { GroupType } from "@/lib/types"

export function CreateGroupDialog() {
    const [open, setOpen] = useState(false)
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

    const form = useForm<z.infer<typeof createGroupSchema>>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            name: "",
            groupType: GroupType.CAREER_SEMESTER,
            period: "2024-1", // Default to current period
            courseId: null,
            careerId: null,
            semester: 1,
        },
    })

    const mutation = useMutation({
        mutationFn: createGroup,
        onSuccess: (result: any) => {
            if (result && !result.error) {
                queryClient.invalidateQueries({ queryKey: ["groups"] })
                toast.success("Grupo creado exitosamente")
                form.reset()
                setOpen(false)
            } else {
                toast.error(result?.error || "Error al crear grupo")
            }
        },
        onError: () => {
            toast.error("Error al crear grupo")
        },
    })

    const onSubmit = (data: z.infer<typeof createGroupSchema>) => {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Grupo
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos del nuevo grupo. Todos los campos marcados con * son obligatorios.
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
                                            form.setValue("semester", 1);
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
                            onClick={() => setOpen(false)}
                            disabled={mutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creando..." : "Crear Grupo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
