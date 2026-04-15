import { EnrollmentForm } from "@/features/applicants/components/EnrollmentForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import db from "@/lib/db"

export default async function EnrollmentPage() {
    const { rows } = await db.query(
        `SELECT i.*, u.name FROM "Institution" i JOIN "User" u ON u.id = i."userId" WHERE i."deletedAt" IS NULL ORDER BY u.name ASC`,
    )
    const institutions = rows

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Ficha de Inscripción</CardTitle>
                        <CardDescription className="text-center">
                            Completa los datos para iniciar tu proceso de inscripción en nuestras instituciones.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EnrollmentForm institutions={institutions as any[]} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
