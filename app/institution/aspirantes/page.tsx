"use client"

import { ApplicantList } from "@/features/applicants/components/ApplicantList"
import { useGetApplicants } from "@/features/applicants/hooks/useApplicants"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { usePathname } from "next/navigation"

export default function AspirantesPage() {
    const pathname = usePathname();
    // Extract institutionId from pathname. Assuming URL structure /institution/[institutionId]/aspirantes
    const institutionId = pathname.split('/')[2];

    const { data: applicants, isLoading, isError } = useGetApplicants()

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-destructive">
                <AlertCircle className="h-10 w-10 mb-4" />
                <p className="text-lg">Error al cargar la lista de aspirantes.</p>
            </div>
        )
    }

    return <ApplicantList initialData={applicants || []} />
}
