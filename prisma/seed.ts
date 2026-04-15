import "dotenv/config";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma"


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const cuid = () => randomBytes(12).toString("base64url");

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Sembrando base de datos — Escuela Normal Rural de Valle de Bravo…");

  const PWD = await hash("password123", 10);
  const NOW = new Date();

  // ── 1. Administrador ──────────────────────────────────────────────────────

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@normalvalle.edu.mx" },
    update: {},
    create: {
      id: cuid(),
      name: "Sistema",
      lastName: "Administrativo",
      email: "admin@normalvalle.edu.mx",
      emailVerified: true,
      role: "ADMIN",
    },
  });

  await prisma.account.upsert({
    where: { id: "acc-admin" },
    update: {},
    create: {
      id: "acc-admin",
      accountId: adminUser.id,
      providerId: "credential",
      userId: adminUser.id,
      password: PWD,
      createdAt: NOW,
      updatedAt: NOW,
    },
  });

  // ── 2. Institución ────────────────────────────────────────────────────────

  const instUser = await prisma.user.upsert({
    where: { email: "direccion@normalvalle.edu.mx" },
    update: {},
    create: {
      id: cuid(),
      name: "Escuela Normal Rural",
      lastName: "de Valle de Bravo",
      email: "direccion@normalvalle.edu.mx",
      emailVerified: true,
      role: "INSTITUTION",
    },
  });

  await prisma.account.upsert({
    where: { id: "acc-inst" },
    update: {},
    create: {
      id: "acc-inst",
      accountId: instUser.id,
      providerId: "credential",
      userId: instUser.id,
      password: PWD,
      createdAt: NOW,
      updatedAt: NOW,
    },
  });

  const institution = await prisma.institution.upsert({
    where: { userId: instUser.id },
    update: {},
    create: {
      id: cuid(),
      userId: instUser.id,
      slug: "normal-valle",
      address: "Carretera Valle de Bravo - Toluca Km 5, Estado de México",
      enableGlobalEvaluation: true,
      globalEvaluationWeight: 0.25,
    },
  });

  // ── 3. Licenciaturas ──────────────────────────────────────────────────────

  const careerLEP = await prisma.career.upsert({
    where: { code: "LPRI" },
    update: {},
    create: {
      id: cuid(),
      name: "Licenciatura en Educación Primaria Intercultural",
      code: "LPRI",
      description: "Formación docente con enfoque intercultural para primaria.",
      totalSemesters: 8,
    },
  });

  const careerLEPresc = await prisma.career.upsert({
    where: { code: "LPRE" },
    update: {},
    create: {
      id: cuid(),
      name: "Licenciatura en Educación Preescolar Comunitaria",
      code: "LPRE",
      description: "Formación docente para atención educativa en contextos comunitarios.",
      totalSemesters: 8,
    },
  });

  for (const career of [careerLEP, careerLEPresc]) {
    await prisma.institutionCareer.upsert({
      where: {
        institutionId_careerId: { institutionId: institution.id, careerId: career.id },
      },
      update: {},
      create: { id: cuid(), institutionId: institution.id, careerId: career.id },
    });
  }

  // ── 4. Asignaturas ────────────────────────────────────────────────────────

  const lepCourses = [
    { name: "Fundamentos de la Educación Intercultural", code: "LPRI-101", credits: 4.5, hours: 6, semester: 1 },
    { name: "Desarrollo Infantil y Contexto Sociocultural", code: "LPRI-102", credits: 4.5, hours: 6, semester: 1 },
    { name: "Didáctica de la Lengua en Primaria", code: "LPRI-103", credits: 4.5, hours: 6, semester: 1 },
    { name: "Práctica Docente Inicial", code: "LPRI-104", credits: 6, hours: 8, semester: 1 },

    { name: "Aprendizaje y Cognición", code: "LPRI-201", credits: 4.5, hours: 6, semester: 2 },
    { name: "Didáctica de las Matemáticas I", code: "LPRI-202", credits: 4.5, hours: 6, semester: 2 },
    { name: "Observación Escolar", code: "LPRI-203", credits: 6, hours: 8, semester: 2 },

    { name: "Lenguaje y Comunicación", code: "LPRI-301", credits: 4.5, hours: 6, semester: 3 },
    { name: "Pensamiento Matemático", code: "LPRI-302", credits: 4.5, hours: 6, semester: 3 },
    { name: "Práctica Docente II", code: "LPRI-303", credits: 6, hours: 8, semester: 3 },
  ];

  const leprescCourses = [
    { name: "Educación Inicial y Contexto Social", code: "LPRE-101", credits: 4.5, hours: 6, semester: 1 },
    { name: "Desarrollo Infantil Temprano", code: "LPRE-102", credits: 4.5, hours: 6, semester: 1 },
    { name: "Didáctica del Juego", code: "LPRE-103", credits: 4.5, hours: 6, semester: 1 },
    { name: "Práctica Educativa Inicial", code: "LPRE-104", credits: 6, hours: 8, semester: 1 },

    { name: "Juego y Aprendizaje", code: "LPRE-201", credits: 4.5, hours: 6, semester: 2 },
    { name: "Desarrollo Socioemocional", code: "LPRE-202", credits: 4.5, hours: 6, semester: 2 },
    { name: "Observación en Preescolar", code: "LPRE-203", credits: 6, hours: 8, semester: 2 },
  ];

  const createdCourses = [];

  for (const [rawList, careerId] of [
    [lepCourses, careerLEP.id],
    [leprescCourses, careerLEPresc.id],
  ]) {
    for (const c of rawList) {
      const course = await prisma.course.upsert({
        where: { code: c.code },
        update: {},
        create: {
          id: cuid(),
          name: c.name,
          code: c.code,
          credits: c.credits,
          hours: c.hours,
          semester: c.semester,
          careerId,
          courseType: "EXCLUSIVE",
          evaluationCount: 3,
          minUnits: 2,
        },
      });
      createdCourses.push(course);

      for (let u = 1; u <= 3; u++) {
        await prisma.unit.upsert({
          where: { courseId_unitNumber: { courseId: course.id, unitNumber: u } },
          update: {},
          create: {
            id: cuid(),
            name: `Unidad ${u}`,
            unitNumber: u,
            weight: 1.0,
            courseId: course.id,
          },
        });
      }
    }
  }

  // ── 5. Docentes ───────────────────────────────────────────────────────────

  const teacherData = [
    {
      email: "mtra.lopez@normalvalle.edu.mx",
      name: "Ana Laura",
      lastName: "López Martínez",
      employeeId: "NV-001",
      department: "Pedagogía",
    },
    {
      email: "mtro.ramirez@normalvalle.edu.mx",
      name: "Luis Fernando",
      lastName: "Ramírez Ortega",
      employeeId: "NV-002",
      department: "Didáctica",
    },
    {
      email: "mtra.cruz@normalvalle.edu.mx",
      name: "Verónica",
      lastName: "Cruz Aguilar",
      employeeId: "NV-003",
      department: "Educación Inicial",
    },
  ];

  const createdTeachers = [];

  for (const t of teacherData) {
    const tUser = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        id: cuid(),
        name: t.name,
        lastName: t.lastName,
        email: t.email,
        emailVerified: true,
        role: "TEACHER",
        institutionId: institution.id,
      },
    });

    await prisma.account.upsert({
      where: { id: `acc-${t.employeeId}` },
      update: {},
      create: {
        id: `acc-${t.employeeId}`,
        accountId: tUser.id,
        providerId: "credential",
        userId: tUser.id,
        password: PWD,
        createdAt: NOW,
        updatedAt: NOW,
      },
    });

    const teacher = await prisma.teacher.upsert({
      where: { employeeId: t.employeeId },
      update: {},
      create: {
        id: cuid(),
        employeeId: t.employeeId,
        department: t.department,
        status: "ACTIVE",
        userId: tUser.id,
        institutionId: institution.id,
      },
    });

    createdTeachers.push(teacher);
  }

  // ── 8. Estudiantes ──────────────────────────────────────────────

  const studentData = [
    { email: "miguel.santos@normalvalle.edu.mx",   name: "Miguel",   lastName: "Santos Ruiz",  enrollmentId: "2025-LPRI-001", curp: "SARL050101HMCRZNA1", birthDay: new Date("2005-01-01"), careerId: careerLEP.id,     currentSemester: 2 },
    { email: "fernanda.perez@normalvalle.edu.mx",  name: "Fernanda", lastName: "Pérez Díaz",   enrollmentId: "2025-LPRI-002", curp: "PEDF060202MMCRZNB2", birthDay: new Date("2006-02-02"), careerId: careerLEP.id,     currentSemester: 2 },
    { email: "karla.rivera@normalvalle.edu.mx",    name: "Karla",    lastName: "Rivera Soto",  enrollmentId: "2025-LPRE-001", curp: "RISK060303MMCRZNC3", birthDay: new Date("2006-03-03"), careerId: careerLEPresc.id, currentSemester: 1 },
  ]

  const createdStudents: { id: string; userId: string; careerId: string; currentSemester: number }[] = []

  for (const s of studentData) {
    const sUser = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        id: cuid(),
        name: s.name,
        lastName: s.lastName,
        email: s.email,
        emailVerified: true,
        role: "STUDENT",
        institutionId: institution.id,
      },
    })

    await prisma.account.upsert({
      where: { id: `acc-${s.enrollmentId}` },
      update: {},
      create: {
        id: `acc-${s.enrollmentId}`,
        accountId: sUser.id,
        providerId: "credential",
        userId: sUser.id,
        password: PWD,
        createdAt: NOW,
        updatedAt: NOW,
      },
    })

    const student = await prisma.student.upsert({
      where: { enrollmentId: s.enrollmentId },
      update: { currentSemester: s.currentSemester },
      create: {
        id: cuid(),
        enrollmentId: s.enrollmentId,
        curp: s.curp,
        birthDay: s.birthDay,
        status: "REGULAR",
        userId: sUser.id,
        institutionId: institution.id,
        careerId: s.careerId,
        currentSemester: s.currentSemester,
      },
    })

    createdStudents.push({ id: student.id, userId: sUser.id, careerId: s.careerId, currentSemester: s.currentSemester })
  }

  const [studentMiguel, studentFernanda, studentKarla] = createdStudents

  // ── 9. Ciclos escolares ───────────────────────────────────────────────────

  const sy2425 = await prisma.schoolYear.upsert({
    where: { id: "sy-2024-2025" },
    update: {},
    create: {
      id: "sy-2024-2025",
      name: "2024-2025",
      startDate: new Date("2024-08-26"),
      endDate:   new Date("2025-06-27"),
      status: "CLOSED",
    },
  })

  const sy2526 = await prisma.schoolYear.upsert({
    where: { id: "sy-2025-2026" },
    update: {},
    create: {
      id: "sy-2025-2026",
      name: "2025-2026",
      startDate: new Date("2025-08-25"),
      endDate:   new Date("2026-06-30"),
      status: "ACTIVE",
    },
  })

  // ── 10. Períodos de evaluación 2025-2026 ──────────────────────────────────

  const ep1 = await prisma.evaluationPeriod.upsert({
    where: { id: "ep-2526-1" },
    update: {},
    create: { id: "ep-2526-1", schoolYearId: sy2526.id, name: "1er Parcial", evaluationNumber: 1, isExtraordinary: false, status: "CLOSED", openDate: new Date("2025-09-01"), closeDate: new Date("2025-10-31") },
  })

  const ep2 = await prisma.evaluationPeriod.upsert({
    where: { id: "ep-2526-2" },
    update: {},
    create: { id: "ep-2526-2", schoolYearId: sy2526.id, name: "2do Parcial", evaluationNumber: 2, isExtraordinary: false, status: "CLOSED", openDate: new Date("2025-11-03"), closeDate: new Date("2026-01-30") },
  })

  await prisma.evaluationPeriod.upsert({
    where: { id: "ep-2526-3" },
    update: {},
    create: { id: "ep-2526-3", schoolYearId: sy2526.id, name: "3er Parcial", evaluationNumber: 3, isExtraordinary: false, status: "OPEN",   openDate: new Date("2026-02-02"), closeDate: new Date("2026-04-30") },
  })

  // ── 11. Grupos 2025-2026 ──────────────────────────────────────────────────

  const grpLEP2 = await prisma.group.upsert({
    where: { institutionId_name_schoolYearId: { institutionId: institution.id, name: "2°A LEP", schoolYearId: sy2526.id } },
    update: {},
    create: { id: "grp-lep-2a-2526", name: "2°A LEP", groupType: "CAREER_SEMESTER", semester: 2, careerId: careerLEP.id, institutionId: institution.id, schoolYearId: sy2526.id },
  })

  const grpLPRE1 = await prisma.group.upsert({
    where: { institutionId_name_schoolYearId: { institutionId: institution.id, name: "1°A LPRE", schoolYearId: sy2526.id } },
    update: {},
    create: { id: "grp-lpre-1a-2526", name: "1°A LPRE", groupType: "CAREER_SEMESTER", semester: 1, careerId: careerLEPresc.id, institutionId: institution.id, schoolYearId: sy2526.id },
  })

  // ── 12. Asignaturas por grupo ─────────────────────────────────────────────

  const findCourse = (code: string) => createdCourses.find(c => c.code === code)!

  const lepSem2Courses  = ["LPRI-201", "LPRI-202", "LPRI-203"].map(findCourse)
  const lepreSem1Courses = ["LPRE-101", "LPRE-102", "LPRE-103", "LPRE-104"].map(findCourse)

  for (const c of lepSem2Courses) {
    await prisma.groupCourse.upsert({
      where: { groupId_courseId: { groupId: grpLEP2.id, courseId: c.id } },
      update: {},
      create: { id: cuid(), groupId: grpLEP2.id, courseId: c.id },
    })
  }
  for (const c of lepreSem1Courses) {
    await prisma.groupCourse.upsert({
      where: { groupId_courseId: { groupId: grpLPRE1.id, courseId: c.id } },
      update: {},
      create: { id: cuid(), groupId: grpLPRE1.id, courseId: c.id },
    })
  }

  // ── 13. Docentes por grupo ────────────────────────────────────────────────

  const [tLopez, tRamirez, tCruz] = createdTeachers

  for (const c of lepSem2Courses.slice(0, 2)) {
    await prisma.teacherGroup.upsert({
      where: { teacherId_groupId_courseId: { teacherId: tLopez.id, groupId: grpLEP2.id, courseId: c.id } },
      update: {},
      create: { id: cuid(), teacherId: tLopez.id, groupId: grpLEP2.id, courseId: c.id },
    })
  }
  await prisma.teacherGroup.upsert({
    where: { teacherId_groupId_courseId: { teacherId: tRamirez.id, groupId: grpLEP2.id, courseId: lepSem2Courses[2].id } },
    update: {},
    create: { id: cuid(), teacherId: tRamirez.id, groupId: grpLEP2.id, courseId: lepSem2Courses[2].id },
  })
  for (const c of lepreSem1Courses) {
    await prisma.teacherGroup.upsert({
      where: { teacherId_groupId_courseId: { teacherId: tCruz.id, groupId: grpLPRE1.id, courseId: c.id } },
      update: {},
      create: { id: cuid(), teacherId: tCruz.id, groupId: grpLPRE1.id, courseId: c.id },
    })
  }

  // ── 14. Inscripciones, calificaciones y asistencia 2025-2026 ─────────────

  // Fetch units for each course: Map<courseId, Unit[]>
  const allUnits = await prisma.unit.findMany({
    where: { courseId: { in: createdCourses.map(c => c.id) } },
    orderBy: { unitNumber: "asc" },
  })
  const unitsByCourse = allUnits.reduce<Record<string, typeof allUnits>>((acc, u) => {
    ;(acc[u.courseId] ??= []).push(u)
    return acc
  }, {})

  // Helper: dates for attendance sessions (weekly starting from start, n sessions)
  function sessionDates(start: Date, n: number): Date[] {
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i * 7)
      return d
    })
  }

  // Grade plan: [studentId, courseId, groupId, [[u1grade, u2grade], ...] ]
  // unit 3 left ungraded (3rd Parcial still open)
  const enrollmentPlan: Array<{
    studentId: string
    courseId: string
    groupId: string
    registeredById: string
    unitGrades: (number | null)[]   // index 0 = unit1, 1 = unit2, 2 = unit3
    u1Sessions: Date[]
    u2Sessions: Date[]
  }> = []

  const lepU1Start = new Date("2025-09-01")
  const lepU2Start = new Date("2025-11-03")
  const lpU1Start  = new Date("2025-09-01")
  const lpU2Start  = new Date("2025-11-03")

  // Miguel and Fernanda → LEP sem 2 courses
  const lepSem2GradesMiguel   = [[8.5, 9.0], [7.5, 8.0], [9.0, 9.5]]
  const lepSem2GradesFernanda = [[9.5, 10.0], [8.0, 8.5], [7.0, 7.5]]

  for (const [si, student] of [[studentMiguel, lepSem2GradesMiguel], [studentFernanda, lepSem2GradesFernanda]] as const) {
    for (const [ci, course] of lepSem2Courses.entries()) {
      const teacher = ci < 2 ? tLopez : tRamirez
      enrollmentPlan.push({
        studentId: si.id,
        courseId: course.id,
        groupId: grpLEP2.id,
        registeredById: teacher.id,
        unitGrades: [student[ci][0], student[ci][1], null],
        u1Sessions: sessionDates(lepU1Start, 8),
        u2Sessions: sessionDates(lepU2Start, 8),
      })
    }
  }

  // Karla → LPRE sem 1 courses
  const lepre1GradesKarla = [[8.0, 7.0], [9.5, 9.0], [7.5, 8.0], [8.5, 9.0]]
  for (const [ci, course] of lepreSem1Courses.entries()) {
    enrollmentPlan.push({
      studentId: studentKarla.id,
      courseId: course.id,
      groupId: grpLPRE1.id,
      registeredById: tCruz.id,
      unitGrades: [lepre1GradesKarla[ci][0], lepre1GradesKarla[ci][1], null],
      u1Sessions: sessionDates(lpU1Start, 8),
      u2Sessions: sessionDates(lpU2Start, 8),
    })
  }

  for (const plan of enrollmentPlan) {
    const enrollment = await prisma.enrollment.upsert({
      where: { studentId_courseId_schoolYearId: { studentId: plan.studentId, courseId: plan.courseId, schoolYearId: sy2526.id } },
      update: {},
      create: {
        id: cuid(),
        studentId: plan.studentId,
        courseId: plan.courseId,
        groupId: plan.groupId,
        schoolYearId: sy2526.id,
        status: "ENROLLED",
      },
    })

    const units = unitsByCourse[plan.courseId] ?? []

    // Unit grades (ordinary, units 1 & 2 only)
    for (const [ui, unit] of units.entries()) {
      const grade = plan.unitGrades[ui]
      if (grade === null) continue
      const ep = ui === 0 ? ep1 : ep2
      await prisma.unitGrade.upsert({
        where: { enrollmentId_unitId_gradeType: { enrollmentId: enrollment.id, unitId: unit.id, gradeType: "ORDINARY" } },
        update: {},
        create: {
          id: cuid(),
          enrollmentId: enrollment.id,
          unitId: unit.id,
          evaluationPeriodId: ep.id,
          grade,
          gradeType: "ORDINARY",
          assignedById: plan.registeredById,
        },
      })
    }

    // Attendance for units 1 & 2
    const attendanceSessions: Array<{ unit: typeof units[0]; dates: Date[] }> = []
    if (units[0]) attendanceSessions.push({ unit: units[0], dates: plan.u1Sessions })
    if (units[1]) attendanceSessions.push({ unit: units[1], dates: plan.u2Sessions })

    for (const { unit, dates } of attendanceSessions) {
      for (const [di, date] of dates.entries()) {
        await prisma.attendance.upsert({
          where: { enrollmentId_unitId_sessionDate: { enrollmentId: enrollment.id, unitId: unit.id, sessionDate: date } },
          update: {},
          create: {
            id: cuid(),
            enrollmentId: enrollment.id,
            unitId: unit.id,
            sessionDate: date,
            present: di !== 2,   // miss session 3 (index 2) for variety
            justified: false,
            registeredById: plan.registeredById,
          },
        })
      }
    }
  }

  // ── 15. Historial académico 2024-2025 (Miguel y Fernanda, semestre 1) ─────

  const lepSem1History = [
    { code: "LPRI-101", name: "Fundamentos de la Educación Intercultural",    credits: 4.5, semester: 1 },
    { code: "LPRI-102", name: "Desarrollo Infantil y Contexto Sociocultural", credits: 4.5, semester: 1 },
    { code: "LPRI-103", name: "Didáctica de la Lengua en Primaria",           credits: 4.5, semester: 1 },
    { code: "LPRI-104", name: "Práctica Docente Inicial",                     credits: 6.0, semester: 1 },
  ]

  const historicalGradesMiguel   = [8.8, 7.9, 9.3, 8.5]
  const historicalGradesFernanda = [9.6, 8.7, 7.4, 9.1]

  for (const [si, grades, histId] of [
    [studentMiguel,   historicalGradesMiguel,   "hist-miguel"],
    [studentFernanda, historicalGradesFernanda, "hist-fernanda"],
  ] as const) {
    for (const [ci, h] of lepSem1History.entries()) {
      const course = findCourse(h.code)
      const fg = grades[ci]
      await prisma.academicHistory.upsert({
        where: { id: `${histId}-${h.code}` },
        update: {},
        create: {
          id: `${histId}-${h.code}`,
          studentId: si.id,
          courseId: course.id,
          courseName: h.name,
          courseCode: h.code,
          courseCredits: h.credits,
          schoolYearName: sy2425.name,
          semester: h.semester,
          finalGrade: fg,
          passed: fg >= 6,
          status: "PASSED",
          wasExtraordinary: false,
          unitsAverage: fg,
          attendancePercentage: 87 + ci * 2,
        },
      })
    }
  }

  console.log("✅ Siembra completa.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
