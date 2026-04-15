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
import { Badge } from "@/components/ui/badge";
import { Search, Pencil, AlertCircle } from "lucide-react";
import { EditTeacherDialog } from "./EditTeacherDialog";
import { useTeachers } from "@/features/teachers/hooks/useTeachers";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";

export function TeacherTable() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const { data: teachersData, isLoading, error } = useTeachers();
  const { data: institutionsData } = useInstitutions();

  const skip = (page - 1) * pageSize;

  const allTeachers = (teachersData as any[]) ?? [];
  const institutions = (institutionsData as any[]) ?? [];

  let filteredTeachers = allTeachers;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredTeachers = allTeachers.filter(teacher =>
      teacher.user.name.toLowerCase().includes(term) ||
      teacher.user.lastName.toLowerCase().includes(term) ||
      teacher.user.email.toLowerCase().includes(term) ||
      (teacher.employeeId && teacher.employeeId.toLowerCase().includes(term))
    );
  }

  const teachers = filteredTeachers.slice(skip, skip + pageSize);
  const totalTeachers = filteredTeachers.length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Listado de Maestros</CardTitle>
          <CardDescription>
            {isLoading
              ? "Cargando..."
              : `Mostrando ${totalTeachers} maestro${totalTeachers !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar maestro..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Institución</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24">
                      <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span>Error al cargar maestros</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !teachers || teachers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron maestros.
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher: any) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.user.name} {teacher.user.lastName}
                        {teacher?.employeeId && (
                          <div className="text-xs text-muted-foreground">
                            ID: {teacher.employeeId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{teacher.user.email}</TableCell>
                      <TableCell>
                        {teacher.institution ? (
                          <Badge variant="outline" className="text-xs">
                            {teacher.institution.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {teachers && teachers.length > 0 && (
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
                  disabled={
                    skip + pageSize >= totalTeachers || isLoading
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTeacher && (
        <EditTeacherDialog
          teacher={selectedTeacher}
          open={!!selectedTeacher}
          onOpenChange={(open) => !open && setSelectedTeacher(null)}
        />
      )}
    </>
  );
}
