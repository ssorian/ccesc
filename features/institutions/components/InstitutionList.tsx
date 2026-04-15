"use client"

import { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Pencil, Trash, ArchiveRestore, AlertCircle } from "lucide-react"
import { InstitutionDialog } from "@/features/institutions/components/InstitutionDialog"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions"
import { toggleInstitutionStatus } from "@/features/institutions/services/institution.service"

export function InstitutionList() {
    const [searchTerm, setSearchTerm] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedInstitution, setSelectedInstitution] = useState<any>(null)

    const { data, isLoading, error } = useInstitutions()
    const queryClient = useQueryClient()

    const toggleMutation = useMutation({
        mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
            toggleInstitutionStatus({ id, activate }),
        onSuccess: (_, { activate }) => {
            queryClient.invalidateQueries({ queryKey: ["institutions"] })
            toast.success(activate ? "Institución activada correctamente" : "Institución desactivada correctamente")
        },
        onError: () => {
            toast.error("Error al cambiar estado de la institución")
        },
    })

    const institutions = (data as any[]) ?? []

    const filteredData = institutions.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEdit = (institution: any) => {
        setSelectedInstitution(institution)
        setDialogOpen(true)
    }

    const handleCreate = () => {
        setSelectedInstitution(null)
        setDialogOpen(true)
    }

    const handleToggleStatus = (id: string, currentlyActive: boolean) => {
        toggleMutation.mutate({ id, activate: !currentlyActive })
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Listado de Instituciones</CardTitle>
                    <CardDescription>
                        {isLoading
                            ? "Cargando..."
                            : `${filteredData.length} institución${filteredData.length !== 1 ? "es" : ""} encontrada${filteredData.length !== 1 ? "s" : ""}`}
                    </CardDescription>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Institución
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar institución..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Dirección</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Cargando...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24">
                                        <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                                            <AlertCircle className="h-5 w-5" />
                                            <span>Error al cargar instituciones</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No se encontraron resultados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((institution) => (
                                    <TableRow key={institution.id}>
                                        <TableCell className="font-medium">{institution.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{institution.slug}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {institution.address || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={(!institution.deletedAt ? "success" : "destructive") as any}>
                                                {!institution.deletedAt ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={toggleMutation.isPending}>
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(institution)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(institution.id, !institution.deletedAt)}
                                                        className={!institution.deletedAt ? "text-red-600" : "text-green-600"}
                                                        disabled={toggleMutation.isPending}
                                                    >
                                                        {!institution.deletedAt ? (
                                                            <>
                                                                <Trash className="mr-2 h-4 w-4" />
                                                                Desactivar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                                                Activar
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <InstitutionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                institution={selectedInstitution}
            />
        </Card>
    )
}
