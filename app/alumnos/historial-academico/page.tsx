import { getAcademicHistory } from "@/features/students/actions/getAcademicHistory"
import { AcademicHistoryTable } from "@/features/students/components/AcademicHistoryTable"
import { redirect } from "next/navigation"

export default async function AcademicHistoryPage() {
    const rows = await getAcademicHistory()

    if (!rows) redirect("/login")

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Historial Académico</h2>
            <AcademicHistoryTable rows={rows} />
        </div>
    )
}
