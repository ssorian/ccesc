"use client"

"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface StudentGradesViewProps {
    student: any
}

export function StudentGradesView({ student }: StudentGradesViewProps) {
    const [selectedCourse, setSelectedCourse] = useState<any>(null)
    const [gradeInput, setGradeInput] = useState<string>("")
    const [isGlobal, setIsGlobal] = useState(false)

    const isPending = false;

    // Group enrollments/history by semester
    // We prioritize AcademicHistory for past records, but we might want to verify against Enrollments
    // For this view, let's assuming we strictly use AcademicHistory + Current Enrollments?
    // Or just fetch all courses from the Career plan and map the student's status?
    // That would be best: "Plan de Estudios" view.

    // However, getting the full plan requires fetching all courses for the career.
    // The `student` object passed here only has `history` and `enrollments`.
    // Let's rely on what we have: History + Enrollments merged.

    // Better approach: Show "Semesters" based on the data we have.
    // Ideally we should fetch the Curriculum (Career -> Courses) and match it.
    // But for now, let's just list what they have.

    // Merge history and enrollments unique by courseId?
    // Actually simpler: iterate history. If mapped to enrollment, fine.

    // Let's create a map of courseId -> { ...data }
    const courseMap = new Map<string, any>()

    // Process Academic History (Past/Finalized)
    student.academicHistory.forEach((record: any) => {
        courseMap.set(record.courseId, { type: 'HISTORY', ...record })
    })

    // Process Enrollments (Current)
    // If exists in history, history usually takes precedence if passed?
    // Or Enrollment is the "live" one.
    student.enrollments.forEach((enrollment: any) => {
        if (!courseMap.has(enrollment.courseId)) {
            courseMap.set(enrollment.courseId, {
                type: 'ENROLLMENT',
                ...enrollment,
                courseName: enrollment.course.name,
                courseCode: enrollment.course.code,
                semester: enrollment.course.semester,
                finalGrade: enrollment.finalGrade || 0,
                passed: enrollment.status === 'APROBADO',
            })
        }
    })

    const courses = Array.from(courseMap.values())

    // Group by Semester
    const semesters: Record<number, any[]> = {}
    courses.forEach(course => {
        const sem = course.semester || 0
        if (!semesters[sem]) semesters[sem] = []
        semesters[sem].push(course)
    })

    const semesterKeys = Object.keys(semesters).map(Number).sort((a, b) => a - b)

    const handleEditClick = (course: any) => {
        setSelectedCourse(course)
        setGradeInput(course.finalGrade?.toString() || "0")
        setIsGlobal(false)
    }

    const handleSaveGrade = async () => {
        if (!selectedCourse) return

        const grade = parseFloat(gradeInput)
        if (isNaN(grade) || grade < 0 || grade > 10) {
            toast.error("Calificación inválida (0-10)")
            return
        }

        toast.success("Calificación actualizada (simulado)");
        setSelectedCourse(null);
    }

    return (
        <div>
            {semesterKeys.length === 0 && <p className="text-muted-foreground p-4">No hay registros académicos.</p>}
            <Accordion type="single" collapsible className="w-full">
                {semesterKeys.map(sem => (
                    <AccordionItem key={sem} value={`sem-${sem}`}>
                        <AccordionTrigger>Semestre {sem}</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                {semesters[sem].map((course: any) => (
                                    <div key={course.id || course.courseId} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                        <div>
                                            <div className="font-medium">{course.courseName}</div>
                                            <div className="text-xs text-muted-foreground">{course.courseCode}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-bold text-lg leading-none">{course.finalGrade}</div>
                                                <Badge variant={course.passed ? ("default" as any) : "destructive"} className={`text-[10px] h-5 mt-1 ${course.passed ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}>
                                                    {course.passed ? "Aprobado" : "Reprobado"}
                                                </Badge>
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => handleEditClick(course)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Calificación</DialogTitle>
                        <DialogDescription>
                            {selectedCourse?.courseName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Calificación Final</Label>
                            <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={gradeInput}
                                onChange={(e) => setGradeInput(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="global" checked={isGlobal} onCheckedChange={(c) => setIsGlobal(!!c)} />
                            <Label htmlFor="global">Es Evaluación Global / Extraordinario</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedCourse(null)}>Cancelar</Button>
                        <Button onClick={handleSaveGrade} disabled={isPending}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
