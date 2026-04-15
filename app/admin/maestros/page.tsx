import { TeacherTable } from "@/features/teachers/components/TeacherTable";

export default function TeachersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maestros</h1>
        <p className="text-muted-foreground">
          Directorio global de personal docente.
        </p>
      </div>
      <TeacherTable />
    </div>
  );
}
