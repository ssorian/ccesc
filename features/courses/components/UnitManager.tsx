"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2, Lock, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getCourseById, createUnit, updateUnit, deleteUnit } from "@/features/courses/services/course.service"

interface UnitManagerProps {
    courseId: string
}

const MAX_UNITS = 4

export function UnitManager({ courseId }: UnitManagerProps) {
    const queryClient = useQueryClient()

    // Estado de edición inline: unitId → { name, weight }
    const [editing, setEditing] = useState<Record<string, { name: string; weight: string }>>({})
    // Estado del formulario de nueva unidad
    const [addingUnit, setAddingUnit] = useState(false)
    const [newUnit, setNewUnit] = useState({ name: "", weight: "1" })

    const { data: courseResult, isLoading } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => getCourseById({ id: courseId }),
        enabled: !!courseId,
    })

    const course = (courseResult as any)
    const units: any[] = course?.units ?? []

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["course", courseId] })
        queryClient.invalidateQueries({ queryKey: ["courses"] })
    }

    const createMutation = useMutation({
        mutationFn: createUnit,
        onSuccess: () => {
            toast.success("Unidad creada")
            setAddingUnit(false)
            setNewUnit({ name: "", weight: "1" })
            invalidate()
        },
        onError: (e: Error) => {
            if (e.message === "UNIT_LOCKED") toast.error("El curso ya tiene inscripciones, no se pueden agregar unidades")
            else toast.error("Error al crear unidad")
        },
    })

    const updateMutation = useMutation({
        mutationFn: updateUnit,
        onSuccess: (_, vars) => {
            toast.success("Unidad actualizada")
            setEditing((prev) => { const next = { ...prev }; delete next[vars.unitId]; return next })
            invalidate()
        },
        onError: (e: Error) => {
            if (e.message === "UNIT_LOCKED") toast.error("El peso no puede editarse después de la primera inscripción")
            else toast.error("Error al actualizar unidad")
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteUnit,
        onSuccess: () => {
            toast.success("Unidad eliminada")
            invalidate()
        },
        onError: (e: Error) => {
            if (e.message === "UNIT_LOCKED") toast.error("No se puede eliminar: la unidad ya tiene calificaciones")
            else toast.error("Error al eliminar unidad")
        },
    })

    const handleAddUnit = () => {
        if (!newUnit.name.trim()) return
        const nextNumber = units.length > 0 ? Math.max(...units.map((u) => u.unitNumber)) + 1 : 1
        createMutation.mutate({
            courseId,
            name: newUnit.name.trim(),
            unitNumber: nextNumber,
            weight: parseFloat(newUnit.weight) || 1,
        })
    }

    const handleSaveEdit = (unitId: string) => {
        const vals = editing[unitId]
        if (!vals) return
        updateMutation.mutate({
            unitId,
            name: vals.name.trim(),
            weight: parseFloat(vals.weight) || 1,
        })
    }

    const handleCancelEdit = (unitId: string) => {
        setEditing((prev) => { const next = { ...prev }; delete next[unitId]; return next })
    }

    const handleStartEdit = (unit: any) => {
        setEditing((prev) => ({
            ...prev,
            [unit.id]: { name: unit.name, weight: String(unit.weight) },
        }))
    }

    if (isLoading) {
        return <div className="py-4 text-sm text-muted-foreground">Cargando unidades...</div>
    }

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                Cada unidad corresponde a un período de evaluación por convención.{" "}
                <span className="font-medium">Unidad 1 = Período 1, Unidad 2 = Período 2,</span> etc.
                Las unidades se bloquean al registrar la primera inscripción.
            </p>

            {/* Lista de unidades existentes */}
            <div className="rounded-md border divide-y">
                {units.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Sin unidades. Agrega al menos una.
                    </div>
                )}
                {units.map((unit: any) => {
                    const isEditingThis = !!editing[unit.id]
                    const isLocked = !!unit.lockedAt

                    return (
                        <div key={unit.id} className="flex items-center gap-3 px-3 py-2">
                            <span className="w-6 text-center text-xs font-bold text-muted-foreground">
                                {unit.unitNumber}
                            </span>

                            {isEditingThis ? (
                                <>
                                    <Input
                                        className="h-7 flex-1 text-sm"
                                        value={editing[unit.id].name}
                                        onChange={(e) =>
                                            setEditing((prev) => ({
                                                ...prev,
                                                [unit.id]: { ...prev[unit.id], name: e.target.value },
                                            }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSaveEdit(unit.id)
                                            if (e.key === "Escape") handleCancelEdit(unit.id)
                                        }}
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">Peso</span>
                                        <Input
                                            className="h-7 w-16 text-sm"
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            value={editing[unit.id].weight}
                                            disabled={isLocked}
                                            onChange={(e) =>
                                                setEditing((prev) => ({
                                                    ...prev,
                                                    [unit.id]: { ...prev[unit.id], weight: e.target.value },
                                                }))
                                            }
                                        />
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveEdit(unit.id)}>
                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCancelEdit(unit.id)}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 text-sm font-medium">{unit.name}</span>
                                    <span className="text-xs text-muted-foreground">Peso {unit.weight}</span>
                                    {isLocked && (
                                        <Badge variant="outline" className="text-xs gap-1">
                                            <Lock className="h-2.5 w-2.5" />
                                            Bloqueada
                                        </Badge>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleStartEdit(unit)}>
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        disabled={isLocked || deleteMutation.isPending}
                                        onClick={() => deleteMutation.mutate({ unitId: unit.id })}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Formulario de nueva unidad */}
            {addingUnit ? (
                <div className="flex items-center gap-2 rounded-md border border-dashed p-2">
                    <span className="w-6 text-center text-xs font-bold text-muted-foreground">
                        {units.length + 1}
                    </span>
                    <Input
                        className="h-7 flex-1 text-sm"
                        placeholder="Nombre de la unidad"
                        value={newUnit.name}
                        autoFocus
                        onChange={(e) => setNewUnit((p) => ({ ...p, name: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddUnit()
                            if (e.key === "Escape") setAddingUnit(false)
                        }}
                    />
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Peso</span>
                        <Input
                            className="h-7 w-16 text-sm"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={newUnit.weight}
                            onChange={(e) => setNewUnit((p) => ({ ...p, weight: e.target.value }))}
                        />
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleAddUnit} disabled={createMutation.isPending}>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setAddingUnit(false)}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    className="self-start"
                    disabled={units.length >= MAX_UNITS}
                    onClick={() => setAddingUnit(true)}
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Agregar unidad
                    {units.length >= MAX_UNITS && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(máx. {MAX_UNITS})</span>
                    )}
                </Button>
            )}
        </div>
    )
}
