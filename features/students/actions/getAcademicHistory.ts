"use server";

import prisma from "@/lib/prisma";
import { authAction } from "@/lib/auth-action";

export interface AcademicHistoryRow {
  id: string;
  courseName: string;
  courseCode: string;
  courseCredits: number;
  schoolYearName: string;
  semester: number;
  finalGrade: number;
}

export const getAcademicHistory = authAction(null, async (_, session) => {
  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
    select: {
      academicHistory: {
        where: { passed: true },
        orderBy: [{ schoolYearName: "desc" }, { semester: "asc" }],
        select: {
          id: true,
          courseName: true,
          courseCode: true,
          courseCredits: true,
          schoolYearName: true,
          semester: true,
          finalGrade: true,
        },
      },
    },
  });

  if (!student) return null;

  return student.academicHistory;
});
