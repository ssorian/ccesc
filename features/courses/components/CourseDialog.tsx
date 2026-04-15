"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import * as z from "zod"
import { createCourse, updateCourse } from "@/features/courses/services/course.service"
import { UnitManager } from "@/features/courses/components/UnitManager"

const createCourseSchema = z.object({
    name: z.string().min(1, "Requerido"),
    code: z.string().min(1, "Requerido"),
    credits: z.number().min(0),
    isWorkshop: z.boolean(),
    semester: z.number().min(1).optional().nullable(),
    careerId: z.string().optional().nullable(),
    description: z.string().optional(),
});

interface CourseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    course?: any
    careers: any[]
    onSuccess?: (data?: any) => void
}

export function CourseDialog({ open, onOpenChange, course, careers, onSuccess }: CourseDialogProps) {
    const isEditing = !!course
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof createCourseSchema>>({
        resolver: zodResolver(createCourseSchema),
        defaultValues: {
            name: "",
            code: "",
            credits: 0,
            isWorkshop: false,
            semester: 1,
            careerId: "",
            description: "",
        },
    })

    const { reset } = form
    const isWorkshop = form.watch("isWorkshop");

    useEffect(() => {
        if (open) {
            reset({
                name: course?.name || "",
                code: course?.code || "",
                credits: course?.credits || 0,
                isWorkshop: course?.courseType === "FREE",
                semester: course?.semester || 1,
                careerId: course?.careerId || (careers.length > 0 ? careers[0].id : ""),
                description: course?.description || "",
            })
        }
    }, [course, open, careers, reset])

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof createCourseSchema>) => {
            if (isEditing) {
                return updateCourse({
                    id: course.id,
                    name: data.name,
                    credits: data.credits,
                    semester: data.isWorkshop ? null : data.semester,
                    careerId: data.isWorkshop ? null : data.careerId,
                    description: data.description || null,
                    courseType: data.isWorkshop ? "FREE" : "EXCLUSIVE",
                })
            } else {
                return createCourse({
                    name: data.name,
                    code: data.code,
                    credits: data.credits,
                    hours: 0,
                    semester: data.isWorkshop ? null : data.semester,
                    careerId: data.isWorkshop ? null : data.careerId,
                    description: data.description,
                    courseType: data.isWorkshop ? "FREE" : "EXCLUSIVE",
                })
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["courses"] })
            toast.success(isEditing ? "Materia actualizada" : "Materia creada")
            if (!isEditing) {
                onOpenChange(false)
                form.reset()
            }
            onSuccess?.(result)
        },
        onError: () => {
            toast.error(isEditing ? "Error al actualizar materia" : "Error al crear materia")
        },
    })

    function onSubmit(data: z.infer<typeof createCourseSchema>) {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Materia" : "Nueva Materia"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Edita los datos de la materia y gestiona sus unidades de evaluación."
                            : "Define los detalles de la materia. Podrás agregar unidades después de crearla."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="datos" className="w-full">
                    <TabsList className="mb-2 w-full">
                        <TabsTrigger value="datos" className="flex-1">Datos</TabsTrigger>
                        <TabsTrigger value="unidades" className="flex-1" disabled={!isEditing}>
                            Unidades
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="datos">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isWorkshop"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Es un taller / curso libre</FormLabel>
                                                <FormDescription>
                                                    Los talleres no dependen de una carrera ni un semestre en específico.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={(val) => {
                                                        field.onChange(val)
                                                        if (val) {
                                                            form.setValue("careerId", "")
                                                            form.setValue("semester", 1)
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Clave</FormLabel>
                                                <FormControl>
                                                    <Input {...field} disabled={isEditing} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="careerId"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0 flex flex-col">
                                                <FormLabel>Carrera</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isWorkshop}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full [&>span]:truncate">
                                                            <SelectValue placeholder="Selecciona carrera" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {careers.map(c => (
                                                            <SelectItem key={c.id} value={c.id}>
                                                                {c.name} {c.institution ? `(${c.institution.name})` : ''}
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
                                        name="credits"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Créditos</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="semester"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Semestre</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value || 1} disabled={isWorkshop} onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={mutation.isPending}>
                                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="unidades">
                        {isEditing && course?.id && (
                            <UnitManager courseId={course.id} />
                        )}
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
