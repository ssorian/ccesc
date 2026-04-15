import { StudentTable } from "@/features/students/components/StudentTable"

export default function StudentsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Alumnos</h1>
                <p className="text-muted-foreground">
                    Directorio global de alumnos.
                </p>
            </div>
            <StudentTable />
        </div>
    )
}
