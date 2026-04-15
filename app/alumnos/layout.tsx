import { StudentMainLayout } from "@/components/layouts/StudentLayout"

const studentUser = {
    name: "Juan Pérez",
    email: "juan.perez@alumno.ccesc.edu",
    avatar: "/avatars/student.jpg",
}

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <StudentMainLayout user={studentUser}>
            {children}
        </StudentMainLayout>
    )
}
