"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, CheckCircle2, XCircle, Clock } from "lucide-react"
import { getApplicants } from "@/features/applicants/services/applicant.service"

import { ApplicantStatus } from "@/lib/types"
import { ReviewDialog } from "@/features/applicants/components/ReviewDialog"

const statusLabels: Record<ApplicantStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }> = {
    PENDING: { label: "Pendiente", variant: "secondary" }, // Changed to secondary/yellowish usually? Or default.
    ACCEPTED: { label: "Aceptado", variant: "default" }, // We don't have success variant in standard badge? defaulting to default (primary).
    REJECTED: { label: "Rechazado", variant: "destructive" },
}

interface ApplicantListProps {
    initialData?: any
}

export function ApplicantList({ initialData }: ApplicantListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [page, setPage] = useState(1)
    const pageSize = 10

    // Actions state
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null)
    const [actionType, setActionType] = useState<"accept" | "reject" | null>(null)

    const { data: applicantsResult, isLoading, refetch } = useQuery({
        queryKey: ["applicants", page, searchTerm, statusFilter],
        queryFn: () =>
            getApplicants({
                skip: (page - 1) * pageSize,
                take: pageSize,
                search: searchTerm || undefined,
                status: statusFilter !== "all" ? (statusFilter as ApplicantStatus) : undefined,
            }),
        initialData: page === 1 && !searchTerm && statusFilter === "all" ? { success: true, data: initialData } : undefined,
    })

    const applicants = (applicantsResult?.success ? applicantsResult.data : []) ?? []

    const handleAction = (applicant: any, type: "accept" | "reject") => {
        setSelectedApplicant(applicant)
        setActionType(type)
    }

    const handleSuccess = () => {
        refetch()
        setSelectedApplicant(null)
        setActionType(null)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Aspirantes</h1>
                    <p className="text-muted-foreground">
                        Gestiona las solicitudes de ingreso a la institución.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Busca y filtra aspirantes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, CURP..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(1)
                                }}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="PENDING">Pendiente</SelectItem>
                                <SelectItem value="ACCEPTED">Aceptado</SelectItem>
                                <SelectItem value="REJECTED">Rechazado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Applicants Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Solicitudes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>CURP</TableHead>
                                <TableHead>Carrera</TableHead>
                                <TableHead>Edad</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Cargando...
                                    </TableCell>
                                </TableRow>
                            ) : applicants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No se encontraron aspirantes.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applicants.map((applicant: any) => (
                                    <TableRow key={applicant.id}>
                                        <TableCell>
                                            <div className="font-medium">{applicant.name} {applicant.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{applicant.email}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{applicant.curp}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {applicant.career?.name || "-"}
                                        </TableCell>
                                        <TableCell>{applicant.age} años</TableCell>
                                        <TableCell>
                                            <Badge variant={statusLabels[applicant.status as ApplicantStatus]?.variant as any || "default"}>
                                                {statusLabels[applicant.status as ApplicantStatus]?.label || applicant.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {applicant.status === "PENDING" && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                        onClick={() => handleAction(applicant, "accept")}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Aceptar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                        onClick={() => handleAction(applicant, "reject")}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Rechazar
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {applicants.length > 0 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Página {page}
                            </div>
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
                                    disabled={applicants.length < pageSize || isLoading}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Dialog */}
            {selectedApplicant && actionType && (
                <ReviewDialog
                    applicant={selectedApplicant}
                    open={!!selectedApplicant}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedApplicant(null)
                            setActionType(null)
                        }
                    }}
                    action={actionType}
                    onSuccess={handleSuccess}
                />
            )}
        </div >
    )
}
