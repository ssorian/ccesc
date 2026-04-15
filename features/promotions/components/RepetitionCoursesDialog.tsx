"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addRepetitionCourses } from "@/features/groups/services/group.service"
import { getGroups } from "@/features/groups/services/group.service"
import type { PromotionReportEntry } from "@/features/promotions/services/promotion.service"

interface RepetitionCoursesDialogProps {
    entry: PromotionReportEntry
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RepetitionCoursesDialog({ entry, open, onOpenChange }: RepetitionCoursesDialogProps) {
    const queryClient = useQueryClient()
    const [selectedGroupId, setSelectedGroupId] = useState<string>("")
    const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
        new Set(entry.failedCourses.map((c) => c.courseId))
    )

    const { data: groupsResult, isLoading: loadingGroups } = useQuery({
        queryKey: ["groups", "semester", entry.currentSemester + 1],
        queryFn: () => getGroups({ semester: entry.currentSemester + 1 }),
        enabled: open,
    })

    const groups = (groupsResult as any[]) ?? []

    const mutation = useMutation({
        mutationFn: addRepetitionCourses,
        onSuccess: () => {
            toast.success("Materias de recursamiento asignadas")
            queryClient.invalidateQueries({ queryKey: ["promotion-report"] })
            onOpenChange(false)
        },
        onError: (err: Error) => {
            toast.error(err.message || "Error al asignar materias")
        },
    })

    const toggleCourse = (courseId: string) => {
        setSelectedCourseIds((prev) => {
            const next = new Set(prev)
            if (next.has(courseId)) next.delete(courseId)
            else next.add(courseId)
            return next
        })
    }

    const handleAssign = () => {
        if (!selectedGroupId) {
            toast.error("Selecciona un grupo destino")
            return
        }
        if (selectedCourseIds.size === 0) {
            toast.error("Selecciona al menos una materia")
            return
        }
        mutation.mutate({
            studentId: entry.studentId,
            groupId: selectedGroupId,
            courseIds: [...selectedCourseIds],
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Asignar Recursamiento</DialogTitle>
                    <DialogDescription>
                        {entry.name} — Semestre {entry.currentSemester + 1}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Group selector */}
                    <div className="space-y-2">
                        <Label>Grupo destino (siguiente semestre)</Label>
                        <Select value={selectedGroupId} onValueChange={setSelectedGroupId} disabled={loadingGroups}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingGroups ? "Cargando grupos..." : "Seleccionar grupo..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((g: any) => (
                                    <SelectItem key={g.id} value={g.id}>
                                        {g.name}
                                        {g.career && <span className="text-muted-foreground ml-1">— {g.career.name}</span>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Failed courses checklist */}
                    <div className="space-y-2">
                        <Label>Materias a recursar</Label>
                        <ScrollArea className="h-48 rounded-md border p-3">
                            <div className="space-y-3">
                                {entry.failedCourses.map((course) => (
                                    <div key={course.courseId} className="flex items-center gap-3">
                                        <Checkbox
                                            id={course.courseId}
                                            checked={selectedCourseIds.has(course.courseId)}
                                            onCheckedChange={() => toggleCourse(course.courseId)}
                                        />
                                        <Label htmlFor={course.courseId} className="flex-1 cursor-pointer font-normal">
                                            <span>{course.name}</span>
                                            <span className="text-xs text-muted-foreground ml-2">{course.code}</span>
                                        </Label>
                                        <Badge variant="destructive" className="text-xs">
                                            {course.finalGrade?.toFixed(1) ?? "—"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <p className="text-xs text-muted-foreground">
                            {selectedCourseIds.size} materia(s) seleccionada(s)
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={mutation.isPending || !selectedGroupId || selectedCourseIds.size === 0}
                    >
                        {mutation.isPending ? "Asignando..." : "Asignar materias"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
