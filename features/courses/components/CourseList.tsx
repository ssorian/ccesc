"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, AlertCircle } from "lucide-react";
import { CourseDialog } from "@/features/courses/components/CourseDialog";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useCareers } from "@/features/careers/hooks/useCareers";

export function CourseList() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const { data: coursesData, isLoading, error } = useCourses();
  const { data: careersData } = useCareers();

  const skip = (page - 1) * pageSize;

  const allCourses = (coursesData as any[]) ?? [];
  const careers = (careersData as any[]) ?? [];

  let filteredCourses = allCourses;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredCourses = allCourses.filter(course =>
      course.name.toLowerCase().includes(term) || course.code.toLowerCase().includes(term)
    );
  }

  const courses = filteredCourses.slice(skip, skip + pageSize);
  const totalCourses = filteredCourses.length;

  const handleCreate = () => {
    setSelectedCourse(null);
    setDialogOpen(true);
  };

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Listado de Materias</CardTitle>
          <CardDescription>
            {isLoading
              ? "Cargando..."
              : `Mostrando ${totalCourses} materia${totalCourses !== 1 ? "s" : ""}`}
          </CardDescription>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Materia
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar materia..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clave</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24">
                    <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span>Error al cargar materias</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !courses || courses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron materias.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course: any) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-mono">{course.code}</TableCell>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>Sem. {course.semester}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {course.career?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {courses && courses.length > 0 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">Página {page}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={skip + pageSize >= totalCourses || isLoading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={selectedCourse}
        careers={careers}
      />
    </Card>
  );
}
