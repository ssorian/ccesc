import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AdminMainLayout } from "@/components/layouts/AdminLayout"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (session?.user?.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <AdminMainLayout user={session!.user}>
            {children}
        </AdminMainLayout>
    )
}
