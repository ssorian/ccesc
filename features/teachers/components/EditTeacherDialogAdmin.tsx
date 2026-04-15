import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const updateTeacherInfoAdminSchema = z.object({
    userId: z.string().min(1, "Requerido"),
    name: z.string().min(1, "Requerido"),
    lastName: z.string().min(1, "Requerido"),
    email: z.string().email("Inválido"),
    employeeId: z.string().optional(),
    department: z.string().optional(),
})

interface EditTeacherDialogProps {
    teacher: any
    institutions: any[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (data?: any) => void
}

export function EditTeacherDialog({ teacher, institutions, open, onOpenChange, onSuccess }: EditTeacherDialogProps) {
    const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])

    const form = useForm<z.infer<typeof updateTeacherInfoAdminSchema>>({
        resolver: zodResolver(updateTeacherInfoAdminSchema),
        defaultValues: {
            userId: "",
            name: "",
            lastName: "",
            email: "",
            employeeId: "",
            department: "",
        },
    })

    useEffect(() => {
        if (teacher && open) {
            form.reset({
                userId: teacher.id,
                name: teacher.name,
                lastName: teacher.lastName,
                email: teacher.email,
                employeeId: teacher.teacher?.employeeId || "",
                department: teacher.teacher?.department || "",
            })
            setSelectedInstitutions(teacher.institutionUsers?.map((iu: any) => iu.institutionId) || [])
        }
    }, [teacher, open, form])

    const isPending = false;

    async function onSubmit(data: z.infer<typeof updateTeacherInfoAdminSchema>) {
        const resultData = {
            id: teacher.id,
            user: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                institutionUsers: selectedInstitutions.map(id => ({
                    institutionId: id,
                    institution: institutions.find(i => i.id === id) || { name: 'Desconocida' }
                }))
            },
            employeeId: data.employeeId,
            department: data.department
        };
        toast.success("Maestro actualizado correctamente")
        onSuccess(resultData)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar Maestro</DialogTitle>
                    <DialogDescription>
                        Modificar información y asignaciones.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
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
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellidos</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="employeeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>No. Empleado</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Departamento</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Instituciones Asignadas</Label>
                            <div className="grid grid-cols-2 gap-2 border p-4 rounded-md h-40 overflow-y-auto">
                                {institutions.map((inst: any) => (
                                    <div key={inst.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={inst.id}
                                            checked={selectedInstitutions.includes(inst.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedInstitutions([...selectedInstitutions, inst.id])
                                                } else {
                                                    setSelectedInstitutions(selectedInstitutions.filter(id => id !== inst.id))
                                                }
                                            }}
                                        />
                                        <Label htmlFor={inst.id} className="text-sm font-normal cursor-pointer">
                                            {inst.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
