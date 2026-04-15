"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { submitApplicationSchema, type SubmitApplicationInput } from "@/features/applicants/types/schema"
import { submitApplication } from "@/features/applicants/types/schema"
import { getCareers } from "@/features/careers/services/career.service"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Institution {
    id: string
    name: string
    slug: string
}

interface Career {
    id: string
    name: string
    code: string
}

interface EnrollmentFormProps {
    institutions: Institution[]
}

export function EnrollmentForm({ institutions }: EnrollmentFormProps) {
    const [isPending, startTransition] = useTransition()
    const [careers, setCareers] = useState<Career[]>([])
    const [loadingCareers, setLoadingCareers] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const form = useForm<SubmitApplicationInput>({
        resolver: zodResolver(submitApplicationSchema),
        defaultValues: {
            name: "",
            lastName: "",
            curp: "",
            email: "",
            age: 0,
            state: "",
            municipality: "",
            neighborhood: "",
            street: "",
            number: "",
            institutionId: "",
            careerId: "",
        },
    })

    const handleInstitutionChange = async (institutionId: string) => {
        form.setValue("institutionId", institutionId)
        form.setValue("careerId", "") // Reset career when institution changes

        if (!institutionId) {
            setCareers([])
            return
        }

        setLoadingCareers(true)
        try {
            const result = await getCareers(institutionId)
            if (result.success && Array.isArray(result.data)) {
                setCareers(result.data as Career[])
            } else {
                toast.error("Error al cargar las carreras")
                setCareers([])
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar las carreras")
        } finally {
            setLoadingCareers(false)
        }
    }

    async function onSubmit(data: SubmitApplicationInput) {
        startTransition(async () => {
            const result = await submitApplication(data)

            if (result.success) {
                setSubmitted(true)
                toast.success("Solicitud enviada correctamente")
            } else {
                toast.error(result.error || "Ocurrió un error")
            }
        })
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-green-50 rounded-lg border border-green-200">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-green-800">¡Solicitud Enviada!</h3>
                <p className="text-green-700 max-w-md">
                    Hemos recibido tus datos correctamente. Tu solicitud está ahora en proceso de revisión por la institución.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Volver al inicio
                </Button>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Datos Personales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre(s)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellido(s)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="curp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CURP</FormLabel>
                                    <FormControl>
                                        <Input placeholder="CURP..." {...field} maxLength={18} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Edad</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Domicilio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Estado" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="municipality"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Municipio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Municipio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="neighborhood"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Colonia</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Colonia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Calle</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Calle" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ext/Int" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Interés Académico</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="institutionId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institución</FormLabel>
                                    <Select
                                        onValueChange={handleInstitutionChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una institución" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {institutions.map((inst) => (
                                                <SelectItem key={inst.id} value={inst.id}>
                                                    {inst.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="careerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Carrera</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={!form.getValues("institutionId") || loadingCareers}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={
                                                    loadingCareers
                                                        ? "Cargando carreras..."
                                                        : "Selecciona una carrera"
                                                } />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {careers.map((career) => (
                                                <SelectItem key={career.id} value={career.id}>
                                                    {career.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando solicitud...
                        </>
                    ) : (
                        "Enviar Solicitud"
                    )}
                </Button>
            </form>
        </Form>
    )
}
