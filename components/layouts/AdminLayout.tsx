"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import {
    Building2,
    CalendarClock,
    LayoutDashboard,
    LibraryBig,
    ScrollText,
    UserCog,
    Users,
} from "lucide-react"

const adminNav = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Instituciones",
        url: "/admin/instituciones",
        icon: Building2,
    },
    {
        title: "Alumnos",
        url: "/admin/alumnos",
        icon: Users,
    },
    {
        title: "Maestros",
        url: "/admin/maestros",
        icon: UserCog,
    },
    {
        title: "Carreras",
        url: "/admin/carreras",
        icon: ScrollText,
    },
    {
        title: "Cursos / Materias",
        url: "/admin/cursos",
        icon: LibraryBig,
    },
    {
        title: "Períodos",
        url: "/admin/periodos",
        icon: CalendarClock,
    },
]

interface AdminMainLayoutProps {
    children: React.ReactNode
    user: any
}

export function AdminMainLayout({ children, user }: AdminMainLayoutProps) {
    return (
        <DashboardLayout
            user={user}
            navMain={adminNav}
            breadcrumb={{ title: "Administración", href: "/admin" }}
        >
            {children}
        </DashboardLayout>
    )
}
