import { getStudentGrades } from "@/features/students/actions/getStudentGrades"
import { StudentGradesView } from "@/features/students/components/StudentGradesView"
import { redirect } from "next/navigation"

export default async function GradesPage() {
    const data = await getStudentGrades()

    if (!data) redirect("/login")

    const { info, rows } = data

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Calificaciones</h2>

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-3">
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Institución</span>
                    <span className="text-sm font-medium">{info.institution}</span>
                </div>
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Programa</span>
                    <span className="text-sm font-medium">{info.career ?? "—"}</span>
                </div>
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Semestre Actual</span>
                    <span className="text-sm font-medium">{info.currentSemester}º Semestre</span>
                </div>
            </div>

            <StudentGradesView rows={rows} />
        </div>
    )
}
