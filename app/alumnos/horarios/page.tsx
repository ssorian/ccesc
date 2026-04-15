import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const scheduleData = [
    {
        dia: "Lunes",
        materia: "Matemáticas Avanzadas",
        horario: "08:00 - 10:00",
        docente: "Dr. Alan Turing",
    },
    {
        dia: "Lunes",
        materia: "Física Cuántica",
        horario: "10:00 - 12:00",
        docente: "Dra. Marie Curie",
    },
    {
        dia: "Martes",
        materia: "Programación Web",
        horario: "08:00 - 10:00",
        docente: "Ing. Ada Lovelace",
    },
    {
        dia: "Miércoles",
        materia: "Base de Datos",
        horario: "12:00 - 14:00",
        docente: "Ing. Grace Hopper",
    },
]

export default function SchedulePage() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Horario de Clases</h2>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Día</TableHead>
                            <TableHead>Materia</TableHead>
                            <TableHead>Horario</TableHead>
                            <TableHead>Docente</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {scheduleData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.dia}</TableCell>
                                <TableCell>{item.materia}</TableCell>
                                <TableCell>{item.horario}</TableCell>
                                <TableCell>{item.docente}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
