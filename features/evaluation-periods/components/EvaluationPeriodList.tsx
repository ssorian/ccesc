"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, Pencil } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
    getEvaluationPeriods,
    getSchoolYears,
} from "@/features/evaluation-periods/actions/evaluation-period.actions"
import { EvaluationPeriodStatus } from "@/lib/types"
import { ConfigurePeriodDialog } from "./ConfigurePeriodDialog"

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = {
    id: string
    evaluationNumber: number
    isExtraordinary: boolean
    status: EvaluationPeriodStatus
    openDate: Date | string | null
    closeDate: Date | string | null
    name: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const UNIT_TYPES = [
    { count: 2, label: "2 Unidades", description: "Primer y segundo corte" },
    { count: 3, label: "3 Unidades", description: "Tres cortes de evaluación" },
    { count: 4, label: "4 Unidades", description: "Cuatro cortes de evaluación" },
] as const

const UNIT_LABELS: Record<number, string> = {
    1: "Unidad 1",
    2: "Unidad 2",
    3: "Unidad 3",
    4: "Unidad 4",
}

const STATUS_CONFIG: Record<
    EvaluationPeriodStatus,
    { label: string; variant: "default" | "secondary" | "outline" }
> = {
    SCHEDULED: { label: "Programado", variant: "outline" },
    OPEN: { label: "Abierto", variant: "default" },
    CLOSED: { label: "Cerrado", variant: "secondary" },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | string | null | undefined) {
    if (!date) return null
    return format(new Date(date as string), "dd MMM yyyy", { locale: es })
}

// ─── Period Row ───────────────────────────────────────────────────────────────

interface PeriodRowProps {
    unitNumber: number
    period?: Period | null
    onEdit: (unitNumber: number, period: Period | null) => void
}

function PeriodRow({ unitNumber, period, onEdit }: PeriodRowProps) {
    const statusInfo = period ? STATUS_CONFIG[period.status] : null
    const openDate = formatDate(period?.openDate)
    const closeDate = formatDate(period?.closeDate)

    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {unitNumber}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{UNIT_LABELS[unitNumber]}</p>
                    {openDate || closeDate ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3 shrink-0" />
                            {openDate ?? "—"} → {closeDate ?? "—"}
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-muted-foreground">Sin fechas configuradas</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {statusInfo ? (
                    <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                        Sin configurar
                    </Badge>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => onEdit(unitNumber, period ?? null)}
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EvaluationPeriodList() {
    const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>("")
    const [dialogState, setDialogState] = useState<{
        open: boolean
        unitNumber: number
        period: Period | null
    }>({ open: false, unitNumber: 1, period: null })

    const { data: schoolYears, isLoading: loadingYears } = useQuery({
        queryKey: ["school-years"],
        queryFn: () => getSchoolYears({}),
        select: (data) => (data as any[]) ?? [],
    })

    const years: any[] = schoolYears ?? []

    const effectiveSchoolYearId =
        selectedSchoolYearId ||
        years.find((y) => y.status === "ACTIVE")?.id ||
        years[0]?.id ||
        ""

    const { data: periodsData, isLoading: loadingPeriods } = useQuery({
        queryKey: ["evaluation-periods", effectiveSchoolYearId],
        queryFn: () => getEvaluationPeriods({ schoolYearId: effectiveSchoolYearId }),
        enabled: !!effectiveSchoolYearId,
        select: (data) => (data as any[]) ?? [],
    })

    const periods: Period[] = periodsData ?? []

    const periodByUnit = Object.fromEntries(
        periods
            .filter((p) => !p.isExtraordinary)
            .map((p) => [p.evaluationNumber, p])
    ) as Record<number, Period | undefined>

    const isLoading = loadingYears || (loadingPeriods && !!effectiveSchoolYearId)

    function handleEdit(unitNumber: number, period: Period | null) {
        setDialogState({ open: true, unitNumber, period })
    }

    return (
        <div className="flex flex-col gap-6">
            {/* School year selector */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Ciclo escolar:</span>
                {loadingYears ? (
                    <Skeleton className="h-9 w-52" />
                ) : (
                    <Select value={effectiveSchoolYearId} onValueChange={setSelectedSchoolYearId}>
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Selecciona un ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y.id} value={y.id}>
                                    <span className="flex items-center gap-2">
                                        {y.name}
                                        {y.status === "ACTIVE" && (
                                            <Badge variant="default" className="px-1.5 py-0 text-xs">
                                                Activo
                                            </Badge>
                                        )}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Stacked cards */}
            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[2, 3, 4].map((n) => (
                        <Skeleton key={n} className="h-36 w-full rounded-xl" />
                    ))}
                </div>
            ) : !effectiveSchoolYearId ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                    No hay ciclos escolares registrados.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {UNIT_TYPES.map(({ count, label, description }) => (
                        <Card key={count}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{label}</CardTitle>
                                <CardDescription className="text-xs">{description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-1 pb-3 px-4">
                                {Array.from({ length: count }, (_, i) => i + 1).map((unitNumber) => (
                                    <PeriodRow
                                        key={unitNumber}
                                        unitNumber={unitNumber}
                                        period={periodByUnit[unitNumber]}
                                        onEdit={handleEdit}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ConfigurePeriodDialog
                open={dialogState.open}
                onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
                schoolYearId={effectiveSchoolYearId}
                evaluationNumber={dialogState.unitNumber}
                currentPeriod={dialogState.period}
            />
        </div>
    )
}
