"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, AlertCircle } from "lucide-react";
import { StudentStatus } from "@/lib/types";
import { useGetStudents } from "@/features/students/hooks/useGetStudents";

const statusLabels: Record<StudentStatus, { label: string; variant: string }> =
{
  REGULAR: { label: "Regular", variant: "default" },
  EXTRAORDINARY: { label: "Extraordinario", variant: "secondary" },
  DROPOUT: { label: "Baja", variant: "destructive" },
  TEMPORARY_LEAVE: { label: "Baja Temporal", variant: "outline" },
};

export function StudentTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, error } = useGetStudents();

  // Client-side filter + pagination (data comes from real DB via server action)
  let filteredStudents = ((data as any)?.students as any[]) ?? [];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredStudents = filteredStudents.filter((s: any) =>
      s.user.name.toLowerCase().includes(term) ||
      s.user.lastName.toLowerCase().includes(term) ||
      s.enrollmentId?.toLowerCase().includes(term)
    );
  }

  if (statusFilter !== "all") {
    filteredStudents = filteredStudents.filter((s: any) => s.status === statusFilter);
  }

  const skip = (page - 1) * pageSize;
  const students = filteredStudents.slice(skip, skip + pageSize);
  const totalStudents = filteredStudents.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Alumnos</CardTitle>
        <CardDescription>
          {isLoading
            ? "Cargando..."
            : `${totalStudents} alumno${totalStudents !== 1 ? "s" : ""} encontrado${totalStudents !== 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, matrícula, CURP..."
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
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="REGULAR">Regular</SelectItem>
              <SelectItem value="EXTRAORDINARY">Extraordinario</SelectItem>
              <SelectItem value="DROPOUT">Baja</SelectItem>
              <SelectItem value="TEMPORARY_LEAVE">Baja Temporal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24">
                    <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span>Error al cargar alumnos</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !students || students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron alumnos.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">
                        {student.user.name} {student.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {student.user.email}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {student.enrollmentId}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {student.career?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (statusLabels[student.status as StudentStatus]
                            ?.variant as any) || "default"
                        }
                      >
                        {statusLabels[student.status as StudentStatus]?.label ||
                          student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/alumnos/${student.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {students && students.length > 0 && (
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
                disabled={skip + pageSize >= totalStudents || isLoading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
