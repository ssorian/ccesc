"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { confirmPromotion } from "@/features/promotions/services/promotion.service"
import type { PromotionReportEntry } from "@/features/promotions/services/promotion.service"
import { PromotionStatus } from "@/lib/types"

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    PROMOTED: { label: "Promovido", variant: "default" },
    PROMOTED_WITH_DEBT: { label: "Promovido con deuda", variant: "secondary" },
    RETAINED: { label: "Retenido", variant: "destructive" },
    PENDING: { label: "Pendiente", variant: "outline" },
}

interface ConfirmPromotionDialogProps {
    entry: PromotionReportEntry
    schoolYearId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ConfirmPromotionDialog({ entry, schoolYearId, open, onOpenChange }: ConfirmPromotionDialogProps) {
    const queryClient = useQueryClient()
    const [status, setStatus] = useState<string>(entry.suggestedStatus)
    const [notes, setNotes] = useState("")

    const mutation = useMutation({
        mutationFn: confirmPromotion,
        onSuccess: () => {
            toast.success("Promoción confirmada")
            queryClient.invalidateQueries({ queryKey: ["promotion-report"] })
            onOpenChange(false)
        },
        onError: (err: Error) => {
            toast.error(err.message || "Error al confirmar promoción")
        },
    })

    const handleConfirm = () => {
        mutation.mutate({
            studentId: entry.studentId,
            schoolYearId,
            status: status as PromotionStatus,
            notes: notes.trim() || undefined,
        })
    }

    const s = STATUS_LABELS[status]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Confirmar Promoción</DialogTitle>
                    <DialogDescription>{entry.name} — Semestre {entry.currentSemester}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-md border p-3">
                            <p className="text-muted-foreground text-xs mb-1">Materias aprobadas</p>
                            <p className="font-semibold text-green-600">{entry.passedCourses.length}</p>
                        </div>
                        <div className="rounded-md border p-3">
                            <p className="text-muted-foreground text-xs mb-1">Materias reprobadas</p>
                            <p className="font-semibold text-destructive">{entry.failedCourses.length}</p>
                        </div>
                    </div>

                    {/* Failed courses list */}
                    {entry.failedCourses.length > 0 && (
                        <div className="rounded-md border p-3 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Materias reprobadas</p>
                            {entry.failedCourses.map((c) => (
                                <div key={c.courseId} className="flex items-center justify-between text-sm">
                                    <span>{c.name}</span>
                                    <Badge variant="destructive" className="text-xs">{c.finalGrade?.toFixed(1) ?? "—"}</Badge>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Status selector */}
                    <div className="space-y-2">
                        <Label>Decisión de promoción</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PROMOTED">Promovido</SelectItem>
                                <SelectItem value="PROMOTED_WITH_DEBT">Promovido con deuda</SelectItem>
                                <SelectItem value="RETAINED">Retenido</SelectItem>
                            </SelectContent>
                        </Select>
                        {s && (
                            <p className="text-xs text-muted-foreground">
                                {status === "PROMOTED" && "El alumno sube de semestre sin materias pendientes."}
                                {status === "PROMOTED_WITH_DEBT" && "El alumno sube de semestre y deberá recursar las materias reprobadas."}
                                {status === "RETAINED" && "El alumno no sube de semestre. Su estatus cambia a Reprobado."}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Notas (opcional)</Label>
                        <Textarea
                            placeholder="Observaciones adicionales..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={mutation.isPending}>
                        {mutation.isPending ? "Guardando..." : "Confirmar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
