"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2 } from "lucide-react";

import { StudentStatus } from "@/lib/types";
import { useGetStudents } from "@/features/students/hooks/useGetStudents";
import { useGetCareers } from "@/features/careers/hooks/useCareers";
import { CreateStudentDialog } from "./CreateStudentDialog";
import { EditStudentDialog } from "./EditStudentDialog";
import { DeleteStudentDialog } from "./DeleteStudentDialog";

const statusLabels: Record<
  StudentStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  REGULAR: { label: "Regular", variant: "default" },
  EXTRAORDINARIO: { label: "Extraordinario", variant: "secondary" },
  BAJA: { label: "Baja", variant: "destructive" },
  BAJA_TEMPORAL: { label: "Baja Temporal", variant: "outline" },
};

export function StudentList({ initialData }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [careerFilter, setCareerFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);

  const { data: responseData, isLoading: queryLoading } = useGetStudents({
    page,
    pageSize,
    search: searchTerm || undefined,
    status:
      statusFilter !== "all" ? (statusFilter as StudentStatus) : undefined,
  });

  const studentsList = responseData?.students || initialData?.students || (Array.isArray(initialData) ? initialData : []);
  const totalStudents = responseData?.total || 0;
  const isLoading = queryLoading && !responseData;

  const { data: careers } = useGetCareers({ skip: 0, take: 100 });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alumnos</h1>
          <p className="text-muted-foreground">
            Gestiona los alumnos de la institución.
          </p>
        </div>
        <CreateStudentDialog />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra alumnos por diferentes criterios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido o matrícula..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="EXTRAORDINARIO">Extraordinario</SelectItem>
                <SelectItem value="BAJA">Baja</SelectItem>
                <SelectItem value="BAJA_TEMPORAL">Baja Temporal</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={careerFilter}
              onValueChange={(value) => {
                setCareerFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Carrera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las carreras</SelectItem>
                {careers?.map((career) => (
                  <SelectItem key={career.id} value={career.id}>
                    {career.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alumnos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Estado</TableHead>
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
              ) : studentsList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron alumnos con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                studentsList.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.matricula}
                    </TableCell>
                    <TableCell>
                      {student.user.name} {student.user.lastName}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {student.career?.name || "-"}
                    </TableCell>
                    <TableCell>{student.currentSemester}°</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusLabels[student.status]?.variant || "default"
                        }
                      >
                        {statusLabels[student.status]?.label || student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingStudent(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingStudent(student)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {studentsList.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
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
                  disabled={studentsList.length < pageSize || isLoading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {editingStudent && (
        <EditStudentDialog
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open) => !open && setEditingStudent(null)}
        />
      )}
      {deletingStudent && (
        <DeleteStudentDialog
          student={deletingStudent}
          open={!!deletingStudent}
          onOpenChange={(open) => !open && setDeletingStudent(null)}
        />
      )}
    </div>
  );
}
