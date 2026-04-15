"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CheckCircle, BookOpen, AlertCircle, Clock } from "lucide-react"
import { getPromotionReport } from "@/features/promotions/services/promotion.service"
import { getSchoolYears } from "@/features/evaluation-periods/actions/evaluation-period.actions"
import { ConfirmPromotionDialog } from "./ConfirmPromotionDialog"
import { RepetitionCoursesDialog } from "./RepetitionCoursesDialog"
import type { PromotionReportEntry } from "@/features/promotions/services/promotion.service"

const STATUS_CONFIG = {
    PROMOTED: { label: "Promovido", variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
    PROMOTED_WITH_DEBT: { label: "Con deuda", variant: "secondary" as const, icon: AlertCircle, color: "text-yellow-600" },
    RETAINED: { label: "Retenido", variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" },
    PENDING: { label: "Pendiente", variant: "outline" as const, icon: Clock, color: "text-muted-foreground" },
}

export function PromotionReport() {
    const [schoolYearId, setSchoolYearId] = useState<string>("")
    const [confirmingEntry, setConfirmingEntry] = useState<PromotionReportEntry | null>(null)
    const [repetitionEntry, setRepetitionEntry] = useState<PromotionReportEntry | null>(null)

    const { data: schoolYears = [] } = useQuery({
        queryKey: ["school-years"],
        queryFn: () => getSchoolYears({}),
    })

    const { data: report = [], isLoading, isError } = useQuery({
        queryKey: ["promotion-report", schoolYearId],
        queryFn: () => getPromotionReport({ schoolYearId }),
        enabled: !!schoolYearId,
    })

    const promoted = report.filter((e) => e.confirmedStatus === "PROMOTED").length
    const withDebt = report.filter((e) => e.confirmedStatus === "PROMOTED_WITH_DEBT").length
    const retained = report.filter((e) => e.confirmedStatus === "RETAINED").length
    const pending = report.filter((e) => !e.confirmedStatus).length

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Promoción de Semestre</h1>
                <p className="text-muted-foreground">
                    Genera el reporte de promoción y confirma el avance de cada alumno.
                </p>
            </div>

            {/* School year selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Ciclo Escolar</CardTitle>
                    <CardDescription>Selecciona el ciclo para generar el reporte de promoción.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={schoolYearId} onValueChange={setSchoolYearId}>
                        <SelectTrigger className="w-full max-w-xs">
                            <SelectValue placeholder="Seleccionar ciclo escolar..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(schoolYears as any[]).map((sy: any) => (
                                <SelectItem key={sy.id} value={sy.id}>
                                    {sy.name}
                                    <span className="text-muted-foreground ml-2 text-xs">({sy.status})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Summary cards — only when data loaded */}
            {schoolYearId && !isLoading && report.length > 0 && (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: "Promovidos", value: promoted, color: "text-green-600" },
                        { label: "Con deuda", value: withDebt, color: "text-yellow-600" },
                        { label: "Retenidos", value: retained, color: "text-destructive" },
                        { label: "Pendientes", value: pending, color: "text-muted-foreground" },
                    ].map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Report table */}
            {schoolYearId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Reporte de Alumnos</CardTitle>
                        <CardDescription>
                            Los estatus de inscripción se finalizan automáticamente al cargar el reporte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Alumno</TableHead>
                                    <TableHead>Matrícula</TableHead>
                                    <TableHead className="text-center">Sem.</TableHead>
                                    <TableHead className="text-center">Aprobadas</TableHead>
                                    <TableHead className="text-center">Reprobadas</TableHead>
                                    <TableHead>Sugerido</TableHead>
                                    <TableHead>Confirmado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            Calculando promociones...
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-destructive">
                                            Error al cargar el reporte.
                                        </TableCell>
                                    </TableRow>
                                ) : report.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No hay alumnos con inscripciones en este ciclo.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    report.map((entry) => {
                                        const suggested = STATUS_CONFIG[entry.suggestedStatus]
                                        const confirmed = entry.confirmedStatus ? STATUS_CONFIG[entry.confirmedStatus] : null
                                        return (
                                            <TableRow key={entry.studentId}>
                                                <TableCell className="font-medium">{entry.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{entry.enrollmentCode}</TableCell>
                                                <TableCell className="text-center">{entry.currentSemester}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-green-600 font-medium">{entry.passedCourses.length}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={entry.failedCourses.length > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                                                        {entry.failedCourses.length}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={suggested.variant}>{suggested.label}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {confirmed ? (
                                                        <Badge variant={confirmed.variant}>{confirmed.label}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {/* Recursamiento button — only for confirmed PROMOTED_WITH_DEBT */}
                                                        {entry.confirmedStatus === "PROMOTED_WITH_DEBT" && entry.failedCourses.length > 0 && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setRepetitionEntry(entry)}
                                                            >
                                                                <BookOpen className="h-3.5 w-3.5 mr-1" />
                                                                Recursar
                                                            </Button>
                                                        )}
                                                        {/* Confirm button — always available to adjust */}
                                                        {entry.pendingCourses.length === 0 && (
                                                            <Button
                                                                variant={entry.confirmedStatus ? "ghost" : "default"}
                                                                size="sm"
                                                                onClick={() => setConfirmingEntry(entry)}
                                                            >
                                                                {entry.confirmedStatus ? "Editar" : "Confirmar"}
                                                            </Button>
                                                        )}
                                                        {entry.pendingCourses.length > 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {entry.pendingCourses.length} mat. pendiente(s)
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Dialogs */}
            {confirmingEntry && (
                <ConfirmPromotionDialog
                    entry={confirmingEntry}
                    schoolYearId={schoolYearId}
                    open={!!confirmingEntry}
                    onOpenChange={(open) => !open && setConfirmingEntry(null)}
                />
            )}
            {repetitionEntry && (
                <RepetitionCoursesDialog
                    entry={repetitionEntry}
                    open={!!repetitionEntry}
                    onOpenChange={(open) => !open && setRepetitionEntry(null)}
                />
            )}
        </div>
    )
}
