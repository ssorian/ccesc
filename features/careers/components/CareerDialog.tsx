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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createCareer, updateCareer } from "@/features/careers/services/career.service"

const createCareerSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    code: z.string().min(1, "El código es requerido"),
    description: z.string().optional(),
    totalSemesters: z.number().min(1),
})

interface CareerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    career?: any
    onSuccess?: (data?: any) => void
}

export function CareerDialog({ open, onOpenChange, career, onSuccess }: CareerDialogProps) {
    const isEditing = !!career
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof createCareerSchema>>({
        resolver: zodResolver(createCareerSchema),
        defaultValues: {
            name: "",
            code: "",
            totalSemesters: 8,
            description: "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                name: career?.name || "",
                code: career?.code || "",
                description: career?.description || "",
                totalSemesters: career?.totalSemesters || 8
            })
        }
    }, [open, career, form])

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof createCareerSchema>) => {
            if (isEditing) {
                return updateCareer({
                    id: career.id,
                    name: data.name,
                    description: data.description || null,
                    totalSemesters: data.totalSemesters,
                })
            } else {
                return createCareer({
                    name: data.name,
                    code: data.code,
                    description: data.description,
                    totalSemesters: data.totalSemesters,
                })
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["careers"] })
            toast.success(isEditing ? "Carrera actualizada" : "Carrera creada")
            onOpenChange(false)
            form.reset()
            onSuccess?.(result)
        },
        onError: () => {
            toast.error(isEditing ? "Error al actualizar carrera" : "Error al crear carrera")
        },
    })

    function onSubmit(data: z.infer<typeof createCareerSchema>) {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Carrera" : "Nueva Carrera"}</DialogTitle>
                    <DialogDescription>
                        Define los detalles de la carrera.
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
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Clave / Código</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalSemesters"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semestres Totales</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            value={field.value}
                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
