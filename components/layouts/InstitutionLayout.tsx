"use client"

import { DashboardLayout } from "@/components/DashboardLayout";
import {
    GraduationCap,
    LayoutDashboard,
    TrendingUp,
    UserCog,
    Users,
    UserPlus,
} from "lucide-react";

const adminNav = [
    {
        title: "Dashboard",
        url: "/institution",
        icon: LayoutDashboard,
        isActive: true,
    },
    {
        title: "Alumnos",
        url: "/institution/alumnos",
        icon: GraduationCap,
    },
    {
        title: "Profesores",
        url: "/institution/profesores",
        icon: UserCog,
    },
    {
        title: "Grupos",
        url: "/institution/grupos",
        icon: Users,
    },
    {
        title: "Aspirantes",
        url: "/institution/aspirantes",
        icon: UserPlus,
    },
    {
        title: "Promociones",
        url: "/institution/promociones",
        icon: TrendingUp,
    },
];

interface InstitutionMainLayoutProps {
    children: React.ReactNode;
    user: any;
}

export function InstitutionMainLayout({ children, user }: InstitutionMainLayoutProps) {
    return (
        <DashboardLayout
            user={user}
            navMain={adminNav}
            breadcrumb={{ title: "Institución", href: "/institution" }}
        >
            {children}
        </DashboardLayout>
    );
}
