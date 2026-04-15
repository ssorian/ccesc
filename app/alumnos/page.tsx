export default function StudentPage() {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                <span className="text-muted-foreground">Resumen de Calificaciones</span>
            </div>
            <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                <span className="text-muted-foreground">Próxima Clase</span>
            </div>
            <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                <span className="text-muted-foreground">Avisos Importantes</span>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:col-span-3 p-6">
                <h2 className="text-2xl font-bold mb-4">Bienvenido, Juan</h2>
                <p className="text-muted-foreground">
                    Selecciona una opción del menú lateral para ver tu información académica.
                </p>
            </div>
        </div>
    )
}
