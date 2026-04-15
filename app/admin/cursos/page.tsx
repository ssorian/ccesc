import { CourseList } from "@/features/courses/components/CourseList"

export default function CoursesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cursos y Materias</h1>
                <p className="text-muted-foreground">
                    Gestión del plan de estudios y asignaturas.
                </p>
            </div>
            <CourseList />
        </div>
    )
}
