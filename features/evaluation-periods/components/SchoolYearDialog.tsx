"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    createSchoolYear,
    updateSchoolYear,
} from "@/features/evaluation-periods/actions/evaluation-period.actions"

const schema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    startDate: z.string().min(1, "La fecha de inicio es requerida"),
    endDate: z.string().min(1, "La fecha de fin es requerida"),
})

type FormValues = z.infer<typeof schema>

function toDateInput(date: Date | string | null | undefined): string {
    if (!date) return ""
    const d = typeof date === "string" ? new Date(date) : date
    return d.toISOString().slice(0, 10)
}

interface SchoolYearDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Pass to edit; omit to create */
    schoolYear?: { id: string; name: string; startDate: string | Date; endDate: string | Date }
}

export function SchoolYearDialog({ open, onOpenChange, schoolYear }: SchoolYearDialogProps) {
    const queryClient = useQueryClient()
    const isEdit = !!schoolYear

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", startDate: "", endDate: "" },
    })

    useEffect(() => {
        if (!open) return
        form.reset(
            isEdit
                ? {
                      name: schoolYear.name,
                      startDate: toDateInput(schoolYear.startDate),
                      endDate: toDateInput(schoolYear.endDate),
                  }
                : { name: "", startDate: "", endDate: "" }
        )
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    const { mutate, isPending } = useMutation({
        mutationFn: isEdit
            ? (data: FormValues) => updateSchoolYear({ id: schoolYear!.id, ...data })
            : createSchoolYear,
        onSuccess: () => {
            toast.success(isEdit ? "Ciclo actualizado" : "Ciclo creado")
            queryClient.invalidateQueries({ queryKey: ["school-years"] })
            onOpenChange(false)
        },
        onError: (e: Error) => {
            const messages: Record<string, string> = {
                END_BEFORE_START: "La fecha de fin debe ser posterior al inicio",
                SCHOOL_YEAR_NOT_EDITABLE: "El ciclo ya inició y no puede modificarse",
                SCHOOL_YEAR_NOT_FOUND: "Ciclo no encontrado",
            }
            toast.error(messages[e.message] ?? "Error al guardar")
        },
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar ciclo escolar" : "Nuevo ciclo escolar"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Solo se permite editar mientras el ciclo esté en estado Planificado."
                            : "El ciclo se creará en estado Planificado. Puedes iniciarlo cuando sea necesario."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 2025-A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de inicio</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de fin</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? "Guardar cambios" : "Crear ciclo"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
