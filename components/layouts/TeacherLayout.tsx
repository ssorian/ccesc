"use client"

import { DashboardLayout } from "@/components/DashboardLayout";
import {
    AlertTriangle,
    BookOpen,
    ClipboardList,
    FileText,
    Users,
    User,
} from "lucide-react";

const teacherNav = [
    {
        title: "Información del docente",
        url: "/profesores",
        icon: User,
        isActive: true,
    },
    {
        title: "Calificaciones por grupo",
        url: "/profesores/calificaciones",
        icon: ClipboardList,
    },
    {
        title: "Reporte de calificaciones",
        url: "/profesores/reportes",
        icon: FileText,
    },
    {
        title: "Regularizaciones",
        url: "/profesores/regularizaciones",
        icon: BookOpen,
    },
    {
        title: "Alumnos irregulares",
        url: "/profesores/irregulares",
        icon: AlertTriangle,
    },
    {
        title: "Listas de asistencia",
        url: "/profesores/asistencia",
        icon: Users,
    },
];

interface TeacherMainLayoutProps {
    children: React.ReactNode;
    user: any;
}

export function TeacherMainLayout({ children, user }: TeacherMainLayoutProps) {
    return (
        <DashboardLayout
            user={user}
            navMain={teacherNav}
            breadcrumb={{ title: "Profesores", href: "/profesores" }}
        >
            {children}
        </DashboardLayout>
    );
}
