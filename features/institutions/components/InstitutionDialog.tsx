"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import * as z from "zod"
import { createInstitution, updateInstitution } from "@/features/institutions/services/institution.service"

const baseInstitutionSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    slug: z.string().min(1, "El slug es requerido"),
    address: z.string().optional(),
});

const createInstitutionSchema = baseInstitutionSchema.extend({
    adminName: z.string().min(1, "El nombre es requerido"),
    adminLastName: z.string().min(1, "El apellido es requerido"),
    adminEmail: z.string().email("Correo inválido"),
    adminPassword: z.string().min(6, "Debe tener al menos 6 caracteres"),
});

const editInstitutionSchema = baseInstitutionSchema.extend({
    adminName: z.string().optional(),
    adminLastName: z.string().optional(),
    adminEmail: z.string().optional(),
    adminPassword: z.string().optional(),
});
type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
type FormValues = z.infer<typeof editInstitutionSchema>;

interface InstitutionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    institution?: any
    onSuccess?: (data?: any) => void
}

export function InstitutionDialog({ open, onOpenChange, institution, onSuccess }: InstitutionDialogProps) {
    const isEditing = !!institution
    const queryClient = useQueryClient()

    const currentSchema = isEditing ? editInstitutionSchema : createInstitutionSchema

    const form = useForm<CreateInstitutionInput>({
        resolver: zodResolver(currentSchema) as any,
        defaultValues: {
            name: institution?.name || "",
            slug: institution?.slug || "",
            address: institution?.address || "",
            adminName: "",
            adminLastName: "",
            adminEmail: "",
            adminPassword: "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                name: institution?.name || "",
                slug: institution?.slug || "",
                address: institution?.address || "",
                adminName: "",
                adminLastName: "",
                adminEmail: "",
                adminPassword: "",
            })
        }
    }, [open, institution, form])

    const mutation = useMutation({
        mutationFn: async (data: CreateInstitutionInput) => {
            if (isEditing) {
                return updateInstitution({
                    id: institution.id,
                    name: data.name,
                    slug: data.slug,
                    address: data.address || null,
                })
            } else {
                return createInstitution({
                    name: data.name,
                    slug: data.slug,
                    address: data.address,
                    adminName: data.adminName,
                    adminLastName: data.adminLastName,
                    adminEmail: data.adminEmail,
                    adminPassword: data.adminPassword,
                })
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["institutions"] })
            toast.success(isEditing ? "Institución actualizada exitosamente" : "Institución creada exitosamente")
            onOpenChange(false)
            form.reset()
            onSuccess?.(result)
        },
        onError: () => {
            toast.error(isEditing ? "Error al actualizar institución" : "Error al crear institución")
        },
    })

    function onSubmit(data: CreateInstitutionInput) {
        mutation.mutate(data)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Institución" : "Nueva Institución"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos de la institución."
                            : "Ingresa los datos para registrar una nueva institución."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Universidad Central" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug (URL)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ej. universidad-central" {...field} />
                                    </FormControl>
                                    <FormDescription>Identificador único para URLs.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Dirección completa" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isEditing && (
                            <div className="space-y-4 rounded-md border p-4">
                                <h3 className="text-sm font-medium">Datos del Administrador</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="adminName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. Juan" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="adminLastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Apellido</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. Pérez" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="adminEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correo Electrónico</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="admin@institucion.edu" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="adminPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="******" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Guardar Cambios" : "Crear Institución"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
