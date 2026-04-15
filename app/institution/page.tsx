import db from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, UserCog, Users, TrendingUp } from "lucide-react"

async function getStats() {
    const [s, t, g, e] = await Promise.all([
        db.query(`SELECT COUNT(*)::int AS cnt FROM "Student" WHERE "deletedAt" IS NULL`),
        db.query(`SELECT COUNT(*)::int AS cnt FROM "Teacher" WHERE "deletedAt" IS NULL`),
        db.query(`SELECT COUNT(*)::int AS cnt FROM "Group" WHERE "deletedAt" IS NULL`),
        db.query(`SELECT COUNT(*)::int AS cnt FROM "Enrollment"`),
    ])
    return {
        totalStudents: s.rows[0].cnt,
        totalTeachers: t.rows[0].cnt,
        totalGroups: g.rows[0].cnt,
        activeEnrollments: e.rows[0].cnt,
    }
}

export default async function InstitutionPage() {
    const stats = await getStats()

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                <p className="text-muted-foreground">
                    Gestiona alumnos, profesores y grupos de tu institución.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            Alumnos registrados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Profesores</CardTitle>
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTeachers}</div>
                        <p className="text-xs text-muted-foreground">
                            Profesores activos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGroups}</div>
                        <p className="text-xs text-muted-foreground">
                            Grupos en este período
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inscripciones</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeEnrollments}</div>
                        <p className="text-xs text-muted-foreground">
                            Inscripciones activas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>
                        Últimas acciones realizadas en el sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Nuevo alumno registrado</p>
                                <p className="text-xs text-muted-foreground">Juan Pérez - Hace 2 horas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Grupo creado</p>
                                <p className="text-xs text-muted-foreground">ISC-5A - Hace 5 horas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Profesor asignado a grupo</p>
                                <p className="text-xs text-muted-foreground">Dr. García → ISC-5A - Hace 1 día</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
