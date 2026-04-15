"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { createTeacherSchema, type CreateTeacherInput } from "@/features/teachers/types/schema"
import { createTeacher } from "@/features/teachers/services/teacher.service"
import { TeacherStatus } from "@/lib/types"

const departments = [
    "Ingeniería",
    "Administración",
    "Ciencias Básicas",
    "Humanidades",
    "Posgrado",
]

export function CreateTeacherDialog() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<CreateTeacherInput>({
        resolver: zodResolver(createTeacherSchema),
        defaultValues: {
            name: "",
            lastName: "",
            email: "",
            password: "",
            employeeId: "",
            department: "",
            status: TeacherStatus.ACTIVO,
        },
    })

    const mutation = useMutation({
        mutationFn: createTeacher,
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ["teachers"] })
                toast.success("Profesor creado exitosamente")
                form.reset()
                setOpen(false)
            } else {
                toast.error(result.error || "Error al crear profesor")
            }
        },
        onError: () => {
            toast.error("Error al crear profesor")
        },
    })

    const onSubmit = (data: CreateTeacherInput) => {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Profesor
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Profesor</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos del nuevo profesor. Todos los campos marcados con * son obligatorios.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                                <Input
                                    id="name"
                                    placeholder="Roberto"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <FieldError>{form.formState.errors.name.message}</FieldError>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="lastName">Apellidos *</FieldLabel>
                                <Input
                                    id="lastName"
                                    placeholder="García Mendoza"
                                    {...form.register("lastName")}
                                />
                                {form.formState.errors.lastName && (
                                    <FieldError>{form.formState.errors.lastName.message}</FieldError>
                                )}
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="email">Correo electrónico *</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="profesor@ccesc.edu"
                                    {...form.register("email")}
                                />
                                {form.formState.errors.email && (
                                    <FieldError>{form.formState.errors.email.message}</FieldError>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Contraseña inicial *</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    {...form.register("password")}
                                />
                                {form.formState.errors.password && (
                                    <FieldError>{form.formState.errors.password.message}</FieldError>
                                )}
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="employeeId">Número de empleado *</FieldLabel>
                                <Input
                                    id="employeeId"
                                    placeholder="EMP001"
                                    {...form.register("employeeId")}
                                />
                                {form.formState.errors.employeeId && (
                                    <FieldError>{form.formState.errors.employeeId.message}</FieldError>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="status">Estado *</FieldLabel>
                                <Select
                                    value={form.watch("status")}
                                    onValueChange={(value) => form.setValue("status", value as TeacherStatus)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Selecciona estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={TeacherStatus.ACTIVO}>Activo</SelectItem>
                                        <SelectItem value={TeacherStatus.INACTIVO}>Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.status && (
                                    <FieldError>{form.formState.errors.status.message}</FieldError>
                                )}
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="department">Departamento *</FieldLabel>
                            <Select
                                value={form.watch("department")}
                                onValueChange={(value) => form.setValue("department", value)}
                            >
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Selecciona un departamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.department && (
                                <FieldError>{form.formState.errors.department.message}</FieldError>
                            )}
                        </Field>
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
                            {mutation.isPending ? "Creando..." : "Crear Profesor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
