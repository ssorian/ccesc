"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useDeleteStudent } from "@/features/students/hooks/useDeleteStudent"

interface DeleteStudentDialogProps {
    student: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteStudentDialog({ student, open, onOpenChange }: DeleteStudentDialogProps) {
    const { mutate, isPending } = useDeleteStudent()

    const handleDelete = () => {
        mutate({ id: student.id }, {
            onSuccess: () => {
                onOpenChange(false)
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Alumno</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar al alumno{" "}
                        <span className="font-semibold">
                            {student.user.name} {student.user.lastName}
                        </span>{" "}
                        (Matrícula: {student.matricula})?
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
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
