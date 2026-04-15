import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function AllUnitsTable({ students, units }: { students: any[], units: any[] }) {
    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Matrícula</TableHead>
                        <TableHead>Nombre</TableHead>
                        {units.map((unit) => (
                            <TableHead key={unit.id} className="text-center">
                                U{unit.unitNumber}
                            </TableHead>
                        ))}
                        <TableHead className="text-center">Promedio</TableHead>
                        <TableHead className="text-center">Final</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => {
                        const enrollment = student.enrollments?.[0]
                        const unitGrades = enrollment?.unitGrades || []

                        // Calculate average if possible
                        // This logic needs to be robust against missing data

                        return (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.matricula}</TableCell>
                                <TableCell>{student.user.name} {student.user.lastName}</TableCell>
                                {units.map((unit) => {
                                    const grade = unitGrades.find((ug: any) => ug.unitId === unit.id)?.grade
                                    return (
                                        <TableCell key={unit.id} className="text-center">
                                            {grade !== undefined && grade !== null ? (
                                                <span className={grade >= 6 ? "text-green-600" : "text-red-600"}>
                                                    {grade.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    )
                                })}
                                <TableCell className="text-center font-semibold">
                                    {enrollment?.unitsAverage ? enrollment.unitsAverage.toFixed(2) : "-"}
                                </TableCell>
                                <TableCell className="text-center font-bold">
                                    {enrollment?.finalGrade ? enrollment.finalGrade.toFixed(1) : "-"}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
