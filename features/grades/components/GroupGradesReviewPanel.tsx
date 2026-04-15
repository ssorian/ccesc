"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ClipboardList, ArrowRight } from "lucide-react"
import { getGroupAuditLogs } from "@/features/grades/services/grade.service"

interface GroupGradesReviewPanelProps {
    groupId: string
    groupName: string
}

export function GroupGradesReviewPanel({ groupId, groupName }: GroupGradesReviewPanelProps) {
    const [open, setOpen] = useState(false)

    const { data: logs, isLoading } = useQuery({
        queryKey: ["group-audit-logs", groupId],
        queryFn: () => getGroupAuditLogs({ groupId }),
        enabled: open,
    })

    // Group logs by student
    const logsByStudent = (logs?.success ? logs.data : [])?.reduce<
        Record<string, { studentName: string; entries: typeof logs.data }>
    >((acc, log) => {
        const student = log.unitGrade.enrollment.student
        const studentId = student.id
        const studentName = `${student.user.name} ${student.user.lastName}`
        if (!acc[studentId]) {
            acc[studentId] = { studentName, entries: [] }
        }
        acc[studentId].entries.push(log)
        return acc
    }, {})

    const studentEntries = Object.entries(logsByStudent ?? {})

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" title="Revisar calificaciones y auditoría">
                    <ClipboardList className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Revisión del Grupo</SheetTitle>
                    <SheetDescription>
                        Historial de cambios de calificación para <strong>{groupName}</strong>.
                        Los registros de auditoría aparecen contextualizados por alumno.
                    </SheetDescription>
                </SheetHeader>

                <Separator className="my-4" />

                <ScrollArea className="h-[calc(100vh-160px)]">
                    {isLoading && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Cargando historial…
                        </p>
                    )}

                    {!isLoading && studentEntries.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No hay registros de auditoría para este grupo.
                        </p>
                    )}

                    {!isLoading && studentEntries.length > 0 && (
                        <Accordion type="multiple" className="w-full">
                            {studentEntries.map(([studentId, { studentName, entries }]) => (
                                <AccordionItem key={studentId} value={studentId}>
                                    <AccordionTrigger className="text-sm font-medium">
                                        <span className="flex items-center gap-2">
                                            {studentName}
                                            <Badge variant="secondary" className="text-xs">
                                                {entries.length} cambio{entries.length !== 1 ? "s" : ""}
                                            </Badge>
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col gap-2 pl-2">
                                            {entries.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="rounded-md border bg-muted/40 px-3 py-2 text-xs"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium text-foreground">
                                                            Unidad {log.unitGrade.unit.unitNumber} — {log.unitGrade.unit.name}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(log.createdAt).toLocaleDateString("es-MX", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <span>{log.oldGrade ?? "—"}</span>
                                                        <ArrowRight className="h-3 w-3" />
                                                        <span className="font-semibold text-foreground">
                                                            {log.newGrade ?? "—"}
                                                        </span>
                                                    </div>
                                                    {log.reason && (
                                                        <p className="mt-1 text-muted-foreground italic">
                                                            "{log.reason}"
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
