import { CareerList } from "@/features/careers/components/CareerList"

export default function CareersPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Carreras</h1>
                <p className="text-muted-foreground">
                    Gestión de oferta educativa global.
                </p>
            </div>
            <CareerList />
        </div>
    )
}
