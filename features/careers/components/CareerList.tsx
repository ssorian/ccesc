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
import { Search, Plus, Pencil, AlertCircle } from "lucide-react";
import { CareerDialog } from "@/features/careers/components/CareerDialog";
import { useCareers } from "@/features/careers/hooks/useCareers";

export function CareerList() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<any>(null);

  const { data: careersData, isLoading, error } = useCareers();

  const skip = (page - 1) * pageSize;
  const allCareers = (careersData as any[]) ?? [];

  let filteredCareers = allCareers;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredCareers = allCareers.filter(career =>
      career.name.toLowerCase().includes(term) || career.code.toLowerCase().includes(term)
    );
  }

  const careers = filteredCareers.slice(skip, skip + pageSize);
  const totalCareers = filteredCareers.length;

  const handleCreate = () => {
    setSelectedCareer(null);
    setDialogOpen(true);
  };

  const handleEdit = (career: any) => {
    setSelectedCareer(career);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Listado de Carreras</CardTitle>
          <CardDescription>
            {isLoading
              ? "Cargando..."
              : `Mostrando ${totalCareers} carrera${totalCareers !== 1 ? "s" : ""}`}
          </CardDescription>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Carrera
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar carrera..."
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
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Instituciones</TableHead>
                <TableHead>Semestres</TableHead>
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
                      <span>Error al cargar carreras</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !careers || careers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron carreras.
                  </TableCell>
                </TableRow>
              ) : (
                careers.map((career: any) => (
                  <TableRow key={career.id}>
                    <TableCell className="font-mono">{career.code}</TableCell>
                    <TableCell className="font-medium">{career.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {career.institutionCareers &&
                          career.institutionCareers.length > 0 ? (
                          career.institutionCareers.map((ic: any) => (
                            <Badge
                              key={ic.institutionId}
                              variant="outline"
                              className="text-xs"
                            >
                              {ic.institution.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs text-center">
                            -
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{career.totalSemesters || career.semester || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(career)}
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
        {careers && careers.length > 0 && (
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
                disabled={skip + pageSize >= totalCareers || isLoading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CareerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        career={selectedCareer}
      />
    </Card>
  );
}
