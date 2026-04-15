import { SchoolYearSection } from "@/features/evaluation-periods/components/SchoolYearSection"
import { EvaluationPeriodList } from "@/features/evaluation-periods/components/EvaluationPeriodList"

export default function AdminPeriodosPage() {
    return (
        <div className="flex flex-col gap-8 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Períodos de Evaluación</h1>
                <p className="text-muted-foreground">
                    Gestiona los ciclos escolares y configura los cortes de calificaciones.
                </p>
            </div>
            <SchoolYearSection />
            <EvaluationPeriodList />
        </div>
    )
}
