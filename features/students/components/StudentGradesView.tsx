"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { CourseRow } from "@/features/students/actions/getStudentGrades"

interface StudentGradesViewProps {
    rows: CourseRow[]
}

function fmt(value: number | null | undefined): string {
    if (value == null) return "—"
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function StudentGradesView({ rows }: StudentGradesViewProps) {
    const maxUnits = rows.reduce((max, r) => {
        const highest = r.unitGrades.reduce((m, ug) => Math.max(m, ug.unitNumber), 0)
        return Math.max(max, r.evaluationCount ?? highest)
    }, 4)

    const unitTabs = Array.from({ length: maxUnits }, (_, i) => i + 1)
    const [selectedUnit, setSelectedUnit] = useState<number | "all">("all")

    const showAll = selectedUnit === "all"

    const visibleRows = showAll
        ? rows
        : rows.filter((r) => {
              const unitCount = r.evaluationCount ?? r.unitGrades.reduce((m, ug) => Math.max(m, ug.unitNumber), 0)
              return unitCount === 0 || unitCount >= (selectedUnit as number)
          })

    const statusLabel = (row: CourseRow) => {
        if (row.type === "enrollment") {
            if (row.status === "PASSED") return { label: "Aprobado", pass: true }
            if (row.status === "FAILED") return { label: "Reprobado", pass: false }
            return { label: "Cursando", pass: null }
        }
        return { label: row.passed ? "Aprobado" : "Reprobado", pass: row.passed }
    }

    return (
        <div className="space-y-4">
            {unitTabs.length > 0 && (
                <Tabs
                    value={String(selectedUnit)}
                    onValueChange={(v) => setSelectedUnit(v === "all" ? "all" : Number(v))}
                >
                    <TabsList>
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        {unitTabs.map((u) => (
                            <TabsTrigger key={u} value={String(u)}>
                                U{u}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-10 text-center">No.</TableHead>
                            <TableHead>Nombre del Curso</TableHead>
                            {showAll ? (
                                <>
                                    {unitTabs.map((u) => (
                                        <TableHead key={u} className="text-center">
                                            U{u}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-center">Prom.</TableHead>
                                    <TableHead className="text-center">Extra.</TableHead>
                                    <TableHead className="text-center font-semibold">Final</TableHead>
                                </>
                            ) : (
                                <TableHead className="text-center">U{selectedUnit}</TableHead>
                            )}
                            <TableHead className="text-center">Asist.</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">%</TableHead>
                            <TableHead className="text-center">Calidad</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleRows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={showAll ? 8 + unitTabs.length : 8}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    No hay registros académicos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleRows.map((row, idx) => {
                                const { label, pass } = statusLabel(row)
                                const gradeByUnit = Object.fromEntries(
                                    row.unitGrades.map((ug) => [ug.unitNumber, ug.grade])
                                )
                                const selectedGrade =
                                    !showAll && typeof selectedUnit === "number"
                                        ? gradeByUnit[selectedUnit]
                                        : undefined

                                const unitAtt =
                                    !showAll && typeof selectedUnit === "number"
                                        ? row.unitAttendance.find((a) => a.unitNumber === selectedUnit)
                                        : null

                                const displayPresent = unitAtt ? unitAtt.present : row.attendancesPresent
                                const displayTotal   = unitAtt ? unitAtt.total   : row.attendancesTotal
                                const displayPct     = unitAtt ? unitAtt.percentage : row.attendancePercentage

                                return (
                                    <TableRow key={row.id}>
                                        <TableCell className="text-center text-muted-foreground">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{row.courseName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.courseCode}
                                                {row.courseSemester != null &&
                                                    ` · Sem. ${row.courseSemester}`}
                                                {" · "}
                                                <span className="italic">{row.schoolYearName}</span>
                                            </div>
                                        </TableCell>
                                        {showAll ? (
                                            <>
                                                {unitTabs.map((u) => (
                                                    <TableCell key={u} className="text-center">
                                                        {fmt(gradeByUnit[u])}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center">
                                                    {fmt(row.unitsAverage)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {fmt(row.extraordinaryGrade)}
                                                </TableCell>
                                                <TableCell className="text-center font-bold">
                                                    {fmt(row.finalGrade)}
                                                </TableCell>
                                            </>
                                        ) : (
                                            <TableCell className="text-center font-medium">
                                                {fmt(selectedGrade)}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-center">
                                            {displayPresent != null ? displayPresent : "—"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {displayTotal != null ? displayTotal : "—"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {displayPct != null ? `${displayPct}%` : "—"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {pass === null ? (
                                                <Badge variant="outline" className="text-xs">
                                                    {label}
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    className={cn(
                                                        "text-xs",
                                                        pass
                                                            ? "bg-green-600 text-white hover:bg-green-700"
                                                            : "bg-destructive text-destructive-foreground"
                                                    )}
                                                >
                                                    {label}
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
