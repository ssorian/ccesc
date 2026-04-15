import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function AdminDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() })

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">
                Bienvenido, {session?.user?.name}. Desde aquí puedes gestionar toda la plataforma.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Instituciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Gestión de planteles educativos.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Gestión de alumnos y profesores.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Académico</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Gestión de carreras y planes de estudio.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
