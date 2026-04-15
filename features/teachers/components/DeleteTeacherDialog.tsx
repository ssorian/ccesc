"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteTeacher } from "@/features/teachers/services/teacher.service"

interface DeleteTeacherDialogProps {
    teacher: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteTeacherDialog({ teacher, open, onOpenChange }: DeleteTeacherDialogProps) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: deleteTeacher,
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ["teachers"] })
                toast.success("Profesor eliminado exitosamente")
                onOpenChange(false)
            } else {
                toast.error(result.error || "Error al eliminar profesor")
            }
        },
        onError: () => {
            toast.error("Error al eliminar profesor")
        },
    })

    const handleDelete = () => {
        mutation.mutate({ id: teacher.id })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Profesor</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar al profesor{" "}
                        <span className="font-semibold">
                            {teacher.user.name} {teacher.user.lastName}
                        </span>{" "}
                        (No. Empleado: {teacher.employeeId})?
                    </DialogDescription>
                    <DialogDescription className="text-destructive">
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={mutation.isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
