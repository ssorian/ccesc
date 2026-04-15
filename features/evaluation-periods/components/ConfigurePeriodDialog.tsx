"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as z from "zod"
import { Loader2 } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { EvaluationPeriodStatus } from "@/lib/types"
import { configurePeriod } from "@/features/evaluation-periods/actions/evaluation-period.actions"

const PERIOD_LABELS: Record<number, string> = {
    1: "Primer Corte",
    2: "Segundo Corte",
    3: "Tercer Corte",
    4: "Cuarto Corte",
}

const STATUS_OPTIONS: { value: EvaluationPeriodStatus; label: string }[] = [
    { value: "SCHEDULED", label: "Programado" },
    { value: "OPEN", label: "Abierto" },
    { value: "CLOSED", label: "Cerrado" },
]

function toDatetimeLocal(date: Date | string | null | undefined): string {
    if (!date) return ""
    const d = typeof date === "string" ? new Date(date) : date
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const schema = z.object({
    openDate: z.string(),
    closeDate: z.string(),
    status: z.enum(["SCHEDULED", "OPEN", "CLOSED"]),
})

export interface ConfigurePeriodDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    schoolYearId: string
    evaluationNumber: number
    isExtraordinary?: boolean
    currentPeriod?: {
        id: string
        status: EvaluationPeriodStatus
        openDate: Date | string | null
        closeDate: Date | string | null
    } | null
}

export function ConfigurePeriodDialog({
    open,
    onOpenChange,
    schoolYearId,
    evaluationNumber,
    isExtraordinary = false,
    currentPeriod,
}: ConfigurePeriodDialogProps) {
    const queryClient = useQueryClient()
    const [showReason, setShowReason] = useState(false)
    const [reason, setReason] = useState("")

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { openDate: "", closeDate: "", status: "SCHEDULED" },
    })

    const selectedStatus = form.watch("status")
    const previousStatus = currentPeriod?.status

    useEffect(() => {
        if (!open) return
        form.reset({
            openDate: toDatetimeLocal(currentPeriod?.openDate),
            closeDate: toDatetimeLocal(currentPeriod?.closeDate),
            status: currentPeriod?.status ?? "SCHEDULED",
        })
        setReason("")
        setShowReason(false)
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const isReopening = previousStatus === "CLOSED" && selectedStatus === "OPEN"
        setShowReason(isReopening)
        if (!isReopening) setReason("")
    }, [selectedStatus, previousStatus])

    const { mutate, isPending } = useMutation({
        mutationFn: configurePeriod,
        onSuccess: () => {
            toast.success("Período actualizado")
            queryClient.invalidateQueries({ queryKey: ["evaluation-periods"] })
            onOpenChange(false)
        },
        onError: (e: Error) => {
            if (e.message === "REASON_REQUIRED") {
                toast.error("Se requiere un motivo para reabrir el período")
            } else if (e.message === "FORBIDDEN") {
                toast.error("Sin permiso para modificar este período")
            } else {
                toast.error("Error al guardar", { description: e.message })
            }
        },
    })

    function onSubmit(data: z.infer<typeof schema>) {
        if (showReason && !reason.trim()) {
            toast.error("Debes ingresar el motivo de reapertura")
            return
        }
        mutate({
            schoolYearId,
            evaluationNumber,
            isExtraordinary,
            openDate: data.openDate || null,
            closeDate: data.closeDate || null,
            status: data.status as EvaluationPeriodStatus,
            reason: reason || undefined,
        })
    }

    const title = isExtraordinary
        ? `Extraordinario ${evaluationNumber}`
        : (PERIOD_LABELS[evaluationNumber] ?? `Corte ${evaluationNumber}`)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Configurar período — {title}</DialogTitle>
                    <DialogDescription>
                        Establece las fechas en que los docentes pueden capturar calificaciones para este período.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="openDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de apertura</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="closeDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de cierre</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            {STATUS_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => field.onChange(opt.value)}
                                                    className="focus:outline-none"
                                                >
                                                    <Badge
                                                        variant={
                                                            field.value === opt.value
                                                                ? opt.value === "OPEN"
                                                                    ? "default"
                                                                    : opt.value === "CLOSED"
                                                                        ? "secondary"
                                                                        : "outline"
                                                                : "outline"
                                                        }
                                                        className={
                                                            field.value === opt.value
                                                                ? "cursor-pointer ring-2 ring-ring ring-offset-1"
                                                                : "cursor-pointer opacity-50 hover:opacity-80"
                                                        }
                                                    >
                                                        {opt.label}
                                                    </Badge>
                                                </button>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {showReason && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="reopen-reason">
                                    Motivo de reapertura <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="reopen-reason"
                                    placeholder="Ej: Corrección por error de captura del docente..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
