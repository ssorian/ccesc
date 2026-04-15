import { InstitutionList } from "@/features/institutions/components/InstitutionList"

export default function InstitutionsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Instituciones</h1>
                    <p className="text-muted-foreground">
                        Gestiona los planteles educativos registrados en la plataforma.
                    </p>
                </div>
            </div>
            <InstitutionList />
        </div>
    )
}
