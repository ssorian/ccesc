"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
import { RefreshCw, Lock } from "lucide-react"
import { GradeInput } from "./GradeInput"
import { updateUnitGrade } from "@/features/grades/services/grade.service"
import { EvaluationPeriodStatus } from "@/lib/types"

interface UnitGradeRow {
    studentId: string
    matricula: string
    name: string
    lastName: string
    status: string
    enrollmentId: string
    unitGradeId: string
    grade: number | null
    version: number
    unitId: string
}

interface UnitGradingTableProps {
    rows: UnitGradeRow[]
    unitNumber: number
    groupId: string
    periodStatus: EvaluationPeriodStatus | null
    /** Called after a successful save so the parent can refresh its data */
    onSaved?: () => void
}

const periodStatusLabels: Record<EvaluationPeriodStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    SCHEDULED: { label: "Programado", variant: "outline" },
    OPEN: { label: "Abierto", variant: "default" },
    CLOSED: { label: "Cerrado", variant: "secondary" },
}

export function UnitGradingTable({ rows, unitNumber, groupId, periodStatus, onSaved }: UnitGradingTableProps) {
    const [lockedCells, setLockedCells] = useState<Record<string, boolean>>({})
    const queryClient = useQueryClient()

    const isPeriodOpen = periodStatus === "OPEN"

    const { mutate: saveGrade } = useMutation({
        mutationFn: updateUnitGrade,
        onSuccess: (_, variables) => {
            setLockedCells((prev) => {
                const next = { ...prev }
                delete next[variables.unitGradeId]
                return next
            })
            queryClient.invalidateQueries({ queryKey: ["groups", groupId] })
            onSaved?.()
        },
        onError: (error: Error, variables) => {
            if (error.message === "OPTIMISTIC_LOCK_ERROR") {
                setLockedCells((prev) => ({ ...prev, [variables.unitGradeId]: true }))
                toast.error("Conflicto de versión detectado", {
                    description:
                        "Otro usuario modificó esta calificación. Recarga los datos antes de reingresar.",
                    action: {
                        label: "Recargar",
                        onClick: () => {
                            queryClient.invalidateQueries({ queryKey: ["groups", groupId] })
                            setLockedCells({})
                        },
                    },
                })
            } else if (error.message === "PERIOD_CLOSED") {
                toast.error("Período cerrado", {
                    description: "El período de evaluación está cerrado. No se pueden guardar cambios.",
                })
            } else if (error.message === "PERIOD_NOT_FOUND") {
                toast.error("Período no configurado", {
                    description: `No existe un período de evaluación N°${unitNumber} para este ciclo escolar. Contacta al administrador.`,
                })
            } else {
                toast.error("Error al guardar calificación", {
                    description: error.message,
                })
            }
        },
    })

    const handleGradeCommit = (row: UnitGradeRow, grade: number | null) => {
        if (grade === null) return
        saveGrade({
            enrollmentId: row.enrollmentId,
            unitId: row.unitId,
            unitGradeId: row.unitGradeId,
            version: row.version,
            grade,
        })
    }

    // Banner cuando el período no está abierto
    if (periodStatus !== null && !isPeriodOpen) {
        const info = periodStatusLabels[periodStatus]
        return (
            <div className="rounded-md border">
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        Período de evaluación{" "}
                        <Badge variant={info.variant} className="mx-1">
                            {info.label}
                        </Badge>
                        — la captura de calificaciones no está disponible.
                    </span>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Matrícula</TableHead>
                            <TableHead>Nombre del Alumno</TableHead>
                            <TableHead className="text-center">Calificación (0–10)</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.studentId} className="opacity-60">
                                <TableCell className="font-medium">{row.matricula}</TableCell>
                                <TableCell>{row.name} {row.lastName}</TableCell>
                                <TableCell className="text-center text-sm text-muted-foreground">
                                    {row.grade !== null ? row.grade : "—"}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={row.status === "REGULAR" ? "default" : "secondary"}>
                                        {row.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    // Período sin configurar aún
    if (periodStatus === null) {
        return (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No existe un período de evaluación N°{unitNumber} configurado para este ciclo escolar.
                El administrador debe crearlo en <strong>Institución → Períodos</strong>.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Matrícula</TableHead>
                        <TableHead>Nombre del Alumno</TableHead>
                        <TableHead className="text-center">Calificación (0–10)</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                                No hay alumnos en este grupo.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => {
                            const isLocked = !!lockedCells[row.unitGradeId]
                            return (
                                <TableRow
                                    key={row.studentId}
                                    className={isLocked ? "border-l-2 border-l-destructive bg-destructive/5" : undefined}
                                >
                                    <TableCell className="font-medium">{row.matricula}</TableCell>
                                    <TableCell>{row.name} {row.lastName}</TableCell>
                                    <TableCell className="text-center">
                                        {isLocked ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-sm text-destructive font-medium">
                                                    Conflicto
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 gap-1 text-xs text-destructive"
                                                    onClick={() => {
                                                        queryClient.invalidateQueries({ queryKey: ["groups", groupId] })
                                                        setLockedCells((prev) => {
                                                            const next = { ...prev }
                                                            delete next[row.unitGradeId]
                                                            return next
                                                        })
                                                    }}
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                    Recargar
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center">
                                                <GradeInput
                                                    value={row.grade}
                                                    onChange={(val) => handleGradeCommit(row, val)}
                                                />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={row.status === "REGULAR" ? "default" : "secondary"}>
                                            {row.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
