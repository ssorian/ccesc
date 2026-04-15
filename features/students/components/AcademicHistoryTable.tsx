import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { AcademicHistoryRow } from "@/features/students/actions/getAcademicHistory"

interface AcademicHistoryTableProps {
    rows: AcademicHistoryRow[]
}

function fmt(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function AcademicHistoryTable({ rows }: AcademicHistoryTableProps) {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No.</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead className="text-center">Semestre</TableHead>
                        <TableHead className="text-center">Ciclo</TableHead>
                        <TableHead className="text-center font-semibold">Calificación</TableHead>
                        <TableHead className="text-center">Créditos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                Sin historial académico.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row, idx) => (
                            <TableRow key={row.id}>
                                <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{row.courseName}</div>
                                    <div className="text-xs text-muted-foreground">{row.courseCode}</div>
                                </TableCell>
                                <TableCell className="text-center">{row.semester}°</TableCell>
                                <TableCell className="text-center italic text-muted-foreground">{row.schoolYearName}</TableCell>
                                <TableCell className="text-center font-bold">{fmt(row.finalGrade)}</TableCell>
                                <TableCell className="text-center">{row.courseCredits}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
