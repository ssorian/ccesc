import { EvaluationPeriodList } from "@/features/evaluation-periods/components/EvaluationPeriodList"

export default function AdminPeriodosPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Períodos de Evaluación</h1>
                <p className="text-muted-foreground">
                    Configura las fechas y el estado de captura de calificaciones para cada corte.
                    Reabrir un período cerrado requiere especificar un motivo.
                </p>
            </div>
            <EvaluationPeriodList />
        </div>
    )
}
