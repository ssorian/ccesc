"use server";

import prisma from "@/lib/prisma";
import { authAction } from "@/lib/auth-action";

export interface CourseRow {
  id: string;
  type: "enrollment" | "history";
  courseName: string;
  courseCode: string;
  courseSemester: number | null;
  evaluationCount: number | null;
  unitGrades: { unitNumber: number; grade: number | null }[];
  unitAttendance: { unitNumber: number; present: number; total: number; percentage: number | null }[];
  extraordinaryGrade: number | null;
  unitsAverage: number | null;
  finalGrade: number | null;
  status: string;
  passed: boolean;
  attendancesPresent: number | null;
  attendancesTotal: number | null;
  attendancePercentage: number | null;
  schoolYearName: string;
}

export const getStudentGrades = authAction(null, async (_, session) => {
  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
    include: {
      career: { select: { name: true } },
      institution: { select: { slug: true, user: { select: { name: true } } } },
      enrollments: {
        where: { deletedAt: null, schoolYear: { status: "ACTIVE" } },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              semester: true,
              evaluationCount: true,
            },
          },
          unitGrades: {
            include: {
              unit: { select: { unitNumber: true, name: true } },
            },
            orderBy: { unit: { unitNumber: "asc" } },
          },
          attendances: {
            select: { present: true, justified: true, unitId: true },
          },
          group: { select: { name: true, semester: true } },
          schoolYear: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      academicHistory: {
        orderBy: [{ schoolYearName: "desc" }, { semester: "asc" }],
      },
    },
  });

  if (!student) return null;

  const enrollmentRows: CourseRow[] = student.enrollments.map((e) => {
    const ordinaryGrades = e.unitGrades.filter(
      (ug) => ug.gradeType === "ORDINARY",
    );
    const extraordinaryGrades = e.unitGrades.filter(
      (ug) => ug.gradeType === "EXTRAORDINARY",
    );

    const extraAvg =
      extraordinaryGrades.length > 0
        ? extraordinaryGrades.reduce((s, g) => s + (g.grade ?? 0), 0) /
          extraordinaryGrades.length
        : null;

    const present = e.attendances.filter(
      (a) => a.present || a.justified,
    ).length;
    const total = e.attendances.length;
    const attendancePercentage =
      total > 0 ? Math.round((present / total) * 100) : null;

    const gradedUnits = ordinaryGrades.filter((ug) => ug.grade != null);
    const computedUnitsAverage =
      gradedUnits.length > 0
        ? gradedUnits.reduce((s, g) => s + g.grade!, 0) / gradedUnits.length
        : null;
    const unitsAverage = e.unitsAverage ?? computedUnitsAverage;
    const finalGrade = e.finalGrade ?? unitsAverage;

    // Build unitId → unitNumber map from unitGrades
    const unitIdToNumber = new Map(
      e.unitGrades.map((ug) => [ug.unitId, ug.unit.unitNumber]),
    );
    const attendanceByUnit = new Map<number, { present: number; total: number }>();
    for (const a of e.attendances) {
      const unitNumber = unitIdToNumber.get(a.unitId);
      if (unitNumber == null) continue;
      const cur = attendanceByUnit.get(unitNumber) ?? { present: 0, total: 0 };
      attendanceByUnit.set(unitNumber, {
        present: cur.present + (a.present || a.justified ? 1 : 0),
        total: cur.total + 1,
      });
    }
    const unitAttendance = Array.from(attendanceByUnit.entries()).map(([unitNumber, att]) => ({
      unitNumber,
      present: att.present,
      total: att.total,
      percentage: att.total > 0 ? Math.round((att.present / att.total) * 100) : null,
    }));

    return {
      id: e.id,
      type: "enrollment" as const,
      courseName: e.course.name,
      courseCode: e.course.code,
      courseSemester: e.course.semester,
      evaluationCount: e.course.evaluationCount,
      unitGrades: ordinaryGrades.map((ug) => ({
        unitNumber: ug.unit.unitNumber,
        grade: ug.grade,
      })),
      unitAttendance,
      extraordinaryGrade: extraAvg,
      unitsAverage,
      finalGrade,
      status: e.status,
      passed: e.status === "PASSED",
      attendancesPresent: present,
      attendancesTotal: total,
      attendancePercentage,
      schoolYearName: e.schoolYear.name,
    };
  });

  const historyRows: CourseRow[] = student.academicHistory.map((h) => ({
    id: h.id,
    type: "history" as const,
    courseName: h.courseName,
    courseCode: h.courseCode,
    courseSemester: h.semester,
    evaluationCount: null as number | null,
    unitGrades: [] as { unitNumber: number; grade: number | null }[],
    unitAttendance: [] as { unitNumber: number; present: number; total: number; percentage: number | null }[],
    extraordinaryGrade: null as number | null,
    unitsAverage: h.unitsAverage,
    finalGrade: h.finalGrade,
    status: h.status,
    passed: h.passed,
    attendancesPresent: null as number | null,
    attendancesTotal: null as number | null,
    attendancePercentage:
      h.attendancePercentage != null
        ? Math.round(h.attendancePercentage)
        : null,
    schoolYearName: h.schoolYearName,
  }));

  return {
    info: {
      career: student.career?.name ?? null,
      institution: student.institution.user.name,
      currentSemester: student.currentSemester,
    },
    rows: enrollmentRows,
  };
});

export type StudentGradesData = NonNullable<
  Awaited<ReturnType<typeof getStudentGrades>>
>;
