"use client"

import { useEffect, useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Users } from "lucide-react"
import { useGetApplicantById } from "@/features/applicants/hooks/useGetApplicantById"
import { updateApplicantStatus, deleteApplicant } from "@/features/applicants/actions/applicant.actions"

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear()
const defaultPeriod = `${currentYear}-1`

const acceptFormSchema = z.object({
    matricula: z.string().min(1, "Matrícula requerida"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    period: z.string().min(1, "Período requerido"),
})

type AcceptFormInput = z.infer<typeof acceptFormSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ReviewDialogProps {
    applicant: {
        id: string
        name: string
        lastName: string
        email: string
        curp: string
    }
    open: boolean
    onOpenChange: (open: boolean) => void
    action: "accept" | "reject"
    onSuccess: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ReviewDialog({ applicant, open, onOpenChange, action, onSuccess }: ReviewDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [assignedGroup, setAssignedGroup] = useState<string | null>(null)

    const { data: fullApplicantData, isLoading: loadingData, isError } = useGetApplicantById({
        id: open ? applicant.id : "",
    })

    const form = useForm<AcceptFormInput>({
        resolver: zodResolver(acceptFormSchema),
        defaultValues: {
            matricula: "",
            password: "",
            period: defaultPeriod,
        },
    })

    useEffect(() => {
        if (isError) toast.error("Error al cargar los datos del aspirante.")
    }, [isError])

    // Reset state when dialog closes/opens
    useEffect(() => {
        if (!open) {
            form.reset()
            setAssignedGroup(null)
        }
    }, [open, form])

    // ── Accept ──────────────────────────────────────────────────────────────

    const handleAccept = (data: AcceptFormInput) => {
        startTransition(async () => {
            const result = await updateApplicantStatus(applicant.id, "ACCEPTED", {
                matricula: data.matricula,
                password: data.password,
                period: data.period,
            })

            if (result.success) {
                const groupName = (result.data as any)?.groupName
                if (groupName) {
                    toast.success(`Alumno aceptado y asignado al grupo ${groupName}`)
                } else {
                    toast.success("Alumno aceptado correctamente")
                }
                onOpenChange(false)
                onSuccess()
            } else {
                toast.error("Error al aceptar al aspirante")
            }
        })
    }

    // ── Reject ──────────────────────────────────────────────────────────────

    const handleReject = () => {
        startTransition(async () => {
            const result = await updateApplicantStatus(applicant.id, "REJECTED")
            if (result.success) {
                toast.success("Aspirante rechazado correctamente")
                onOpenChange(false)
                onSuccess()
            } else {
                toast.error("Error al rechazar al aspirante")
            }
        })
    }

    // ── Reject dialog ────────────────────────────────────────────────────────

    if (action === "reject") {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar Aspirante</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas rechazar a{" "}
                            <b>{applicant.name} {applicant.lastName}</b>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechazar Solicitud"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    // ── Accept dialog ────────────────────────────────────────────────────────

    const career = fullApplicantData?.institutionCareer?.career
    const institution = fullApplicantData?.institutionCareer?.institution

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Aceptar Aspirante</DialogTitle>
                    <DialogDescription>
                        Registra a <b>{applicant.name} {applicant.lastName}</b> como alumno.
                        Se le asignará automáticamente a un grupo de{" "}
                        <b>{career?.name ?? "su carrera"}</b> — semestre 1.
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Info summary */}
                        {career && (
                            <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm space-y-1">
                                <div className="flex items-center gap-2 font-medium">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    Información del aspirante
                                </div>
                                <p className="text-muted-foreground">
                                    <span className="font-medium text-foreground">Carrera:</span>{" "}
                                    {career.name} ({career.code})
                                </p>
                                {institution && (
                                    <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Institución:</span>{" "}
                                        {institution.name}
                                    </p>
                                )}
                                <p className="text-muted-foreground">
                                    <span className="font-medium text-foreground">CURP:</span>{" "}
                                    {applicant.curp}
                                </p>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAccept)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="matricula"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Matrícula asignada</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. 2024101" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña temporal</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Mín. 6 caracteres" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="period"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Período de ingreso</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. 2025-1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        disabled={isPending}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isPending || loadingData}>
                                        {isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Aceptar y asignar grupo
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
