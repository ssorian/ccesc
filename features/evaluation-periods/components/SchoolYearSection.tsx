"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, Pencil, Plus, ArrowRight, Lock } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getSchoolYears, updateSchoolYearStatus } from "@/features/evaluation-periods/actions/evaluation-period.actions"
import { SchoolYearDialog } from "./SchoolYearDialog"
import { SchoolYearStatus } from "@/lib/types"

const STATUS_CONFIG: Record<
    SchoolYearStatus,
    { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
    PLANNED: { label: "Planificado", variant: "outline" },
    ACTIVE: { label: "Activo", variant: "default" },
    CLOSED: { label: "Cerrado", variant: "secondary" },
}

const NEXT_STATUS: Partial<Record<SchoolYearStatus, { to: SchoolYearStatus; label: string; destructive?: boolean }>> = {
    PLANNED: { to: "ACTIVE", label: "Iniciar ciclo" },
    ACTIVE: { to: "CLOSED", label: "Cerrar ciclo", destructive: true },
}

const TRANSITION_WARNINGS: Partial<Record<SchoolYearStatus, string>> = {
    ACTIVE: "Una vez iniciado el ciclo, las fechas no podrán modificarse.",
    CLOSED: "Cerrar el ciclo es irreversible. Ya no se podrán capturar calificaciones.",
}

function formatDate(date: Date | string | null | undefined) {
    if (!date) return "—"
    return format(new Date(date as string), "dd MMM yyyy", { locale: es })
}

interface TransitionTarget {
    id: string
    name: string
    to: SchoolYearStatus
    label: string
    destructive?: boolean
}

export function SchoolYearSection() {
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingYear, setEditingYear] = useState<any>(null)
    const [transitioning, setTransitioning] = useState<TransitionTarget | null>(null)

    const { data: schoolYears, isLoading } = useQuery({
        queryKey: ["school-years"],
        queryFn: () => getSchoolYears({}),
        select: (d) => (d as any[]) ?? [],
    })

    const years: any[] = schoolYears ?? []

    const { mutate: doTransition, isPending: transitionPending } = useMutation({
        mutationFn: ({ id, newStatus }: { id: string; newStatus: SchoolYearStatus }) =>
            updateSchoolYearStatus({ id, newStatus }),
        onSuccess: (_, { newStatus }) => {
            const labels: Record<SchoolYearStatus, string> = {
                PLANNED: "Ciclo revertido",
                ACTIVE: "Ciclo iniciado",
                CLOSED: "Ciclo cerrado",
            }
            toast.success(labels[newStatus])
            queryClient.invalidateQueries({ queryKey: ["school-years"] })
            setTransitioning(null)
        },
        onError: (e: Error) => {
            const messages: Record<string, string> = {
                INVALID_TRANSITION: "Transición de estado no permitida",
                SCHOOL_YEAR_NOT_FOUND: "Ciclo no encontrado",
            }
            toast.error(messages[e.message] ?? "Error al cambiar estado")
            setTransitioning(null)
        },
    })

    function handleEdit(year: any) {
        setEditingYear(year)
        setDialogOpen(true)
    }

    function handleCreate() {
        setEditingYear(null)
        setDialogOpen(true)
    }

    function handleTransition(year: any, next: { to: SchoolYearStatus; label: string; destructive?: boolean }) {
        setTransitioning({ id: year.id, name: year.name, to: next.to, label: next.label, destructive: next.destructive })
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle>Ciclos Escolares</CardTitle>
                        <CardDescription>
                            Configura fechas de inicio y fin. Una vez iniciado el ciclo, las fechas quedan bloqueadas.
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={handleCreate}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Nuevo ciclo
                    </Button>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col gap-2 px-6 pb-6">
                            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                        </div>
                    ) : years.length === 0 ? (
                        <p className="px-6 pb-6 text-sm text-muted-foreground">
                            No hay ciclos escolares registrados. Crea el primero.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {years.map((year) => {
                                const statusInfo = STATUS_CONFIG[year.status as SchoolYearStatus]
                                const next = NEXT_STATUS[year.status as SchoolYearStatus]
                                const isEditable = year.status === "PLANNED"

                                return (
                                    <div key={year.id} className="flex items-center justify-between px-6 py-4 gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{year.name}</p>
                                                <Badge variant={statusInfo.variant} className="text-xs">
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {formatDate(year.startDate)} → {formatDate(year.endDate)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {/* Edit — only when PLANNED */}
                                            {isEditable ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    title="Editar ciclo"
                                                    onClick={() => handleEdit(year)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground cursor-not-allowed"
                                                    title="Las fechas están bloqueadas una vez iniciado el ciclo"
                                                    disabled
                                                >
                                                    <Lock className="h-3.5 w-3.5" />
                                                </Button>
                                            )}

                                            {/* Status transition */}
                                            {next && (
                                                <Button
                                                    variant={next.destructive ? "destructive" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleTransition(year, next)}
                                                >
                                                    <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                                                    {next.label}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit dialog */}
            <SchoolYearDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) setEditingYear(null)
                }}
                schoolYear={editingYear ?? undefined}
            />

            {/* Status transition confirmation */}
            <AlertDialog open={!!transitioning} onOpenChange={(open) => !open && setTransitioning(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {transitioning?.label}: {transitioning?.name}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {transitioning && TRANSITION_WARNINGS[transitioning.to]
                                ? TRANSITION_WARNINGS[transitioning.to]
                                : "¿Confirmas el cambio de estado?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={transitionPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                transitioning &&
                                doTransition({ id: transitioning.id, newStatus: transitioning.to })
                            }
                            disabled={transitionPending}
                            className={transitioning?.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                        >
                            {transitionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
