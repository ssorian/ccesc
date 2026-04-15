"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import {
    BookOpen,
    GraduationCap,
    LayoutDashboard,
    MessageSquare,
    User,
} from "lucide-react"

const studentNav = [
    {
        title: "Datos del alumno",
        url: "/alumnos/datos",
        icon: User,
        isActive: true,
    },
    {
        title: "Historial académico",
        url: "/alumnos/historial-academico",
        icon: BookOpen,
    },
    {
        title: "Horarios",
        url: "/alumnos/horarios",
        icon: LayoutDashboard,
    },
    {
        title: "Calificaciones",
        url: "/alumnos/calificaciones",
        icon: GraduationCap,
    },
    {
        title: "Satisfacción",
        url: "/alumnos/encuestas",
        icon: MessageSquare,
    },
]

interface StudentMainLayoutProps {
    children: React.ReactNode
    user: any
}

export function StudentMainLayout({ children, user }: StudentMainLayoutProps) {
    return (
        <DashboardLayout
            user={user}
            navMain={studentNav}
            breadcrumb={{ title: "Alumnos", href: "/alumnos" }}
        >
            {children}
        </DashboardLayout>
    )
}
