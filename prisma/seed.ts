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
  console.log("🌱 Sembrando base de datos — Escuelas Normales del Estado de México…");

  // Hash único para todos los usuarios
  const PWD = await hash("password123", 10);
  const NOW = new Date();

  // ── 1. Administrador ──────────────────────────────────────────────────────

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@normales.com" },
    update: {},
    create: {
      id: cuid(),
      name: "Administrador",
      lastName: "del Sistema",
      email: "admin@normales.com",
      emailVerified: true,
      role: "ADMIN",
    },
  });

  // Account — campos requeridos: id, accountId, providerId, userId, createdAt, updatedAt
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
    where: { email: "direccion@normales.com" },
    update: {},
    create: {
      id: cuid(),
      name: "Benemérita y Centenaria",
      lastName: "Escuela Normal del Estado de México",
      email: "direccion@normales.com",
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
      slug: "becenm",
      address: "Av. Nezahualcóyotl S/N, Toluca, Estado de México",
      enableGlobalEvaluation: true,
      globalEvaluationWeight: 0.3,
    },
  });

  // ── 3. Licenciaturas ──────────────────────────────────────────────────────

  const careerLEP = await prisma.career.upsert({
    where: { code: "LEP" },
    update: {},
    create: {
      id: cuid(),
      name: "Licenciatura en Educación Primaria",
      code: "LEP",
      description: "Formación de docentes para el nivel de educación primaria.",
      totalSemesters: 8,
    },
  });

  const careerLEPresc = await prisma.career.upsert({
    where: { code: "LEPREESC" },
    update: {},
    create: {
      id: cuid(),
      name: "Licenciatura en Educación Preescolar",
      code: "LEPREESC",
      description: "Formación de docentes para el nivel de educación preescolar.",
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
    // Semestre 1
    { name: "Bases Filosóficas, Legales y Organizativas del Sistema Educativo Mexicano", code: "LEP-101", credits: 4.5, hours: 6, semester: 1 },
    { name: "Psicología del Desarrollo Infantil (0-12 años)", code: "LEP-102", credits: 4.5, hours: 6, semester: 1 },
    { name: "Propósitos y Contenidos de la Educación Básica I", code: "LEP-103", credits: 4.5, hours: 6, semester: 1 },
    { name: "Iniciación al Trabajo Docente", code: "LEP-104", credits: 6, hours: 8, semester: 1 },
    // Semestre 2
    { name: "El Niño: Desarrollo y Proceso de Construcción del Conocimiento", code: "LEP-201", credits: 4.5, hours: 6, semester: 2 },
    { name: "Propósitos y Contenidos de la Educación Básica II", code: "LEP-202", credits: 4.5, hours: 6, semester: 2 },
    { name: "Observación y Práctica Docente I", code: "LEP-203", credits: 6, hours: 8, semester: 2 },
    // Semestre 3
    { name: "Adquisición y Enseñanza de la Lengua Escrita", code: "LEP-301", credits: 4.5, hours: 6, semester: 3 },
    { name: "Matemáticas y su Enseñanza I", code: "LEP-302", credits: 4.5, hours: 6, semester: 3 },
    { name: "Observación y Práctica Docente II", code: "LEP-303", credits: 6, hours: 8, semester: 3 },
  ];

  const leprescCourses = [
    // Semestre 1
    { name: "Bases Filosóficas, Legales y Organizativas del Sistema Educativo Mexicano", code: "LEPREESC-101", credits: 4.5, hours: 6, semester: 1 },
    { name: "Psicología del Desarrollo Infantil (0-6 años)", code: "LEPREESC-102", credits: 4.5, hours: 6, semester: 1 },
    { name: "Propósitos y Contenidos de la Educación Preescolar", code: "LEPREESC-103", credits: 4.5, hours: 6, semester: 1 },
    { name: "Iniciación al Trabajo Docente en Preescolar", code: "LEPREESC-104", credits: 6, hours: 8, semester: 1 },
    // Semestre 2
    { name: "El Juego en la Educación Preescolar", code: "LEPREESC-201", credits: 4.5, hours: 6, semester: 2 },
    { name: "Desarrollo de Competencias en Preescolar", code: "LEPREESC-202", credits: 4.5, hours: 6, semester: 2 },
    { name: "Observación y Práctica Docente en Preescolar I", code: "LEPREESC-203", credits: 6, hours: 8, semester: 2 },
  ];

  const createdCourses: Awaited<ReturnType<typeof prisma.course.upsert>>[] = [];

  for (const [rawList, careerId] of [
    [lepCourses, careerLEP.id],
    [leprescCourses, careerLEPresc.id],
  ] as [typeof lepCourses, string][]) {
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

      // 3 unidades por asignatura
      for (let u = 1; u <= 3; u++) {
        await prisma.unit.upsert({
          where: { courseId_unitNumber: { courseId: course.id, unitNumber: u } },
          update: {},
          create: { id: cuid(), name: `Unidad ${u}`, unitNumber: u, weight: 1.0, courseId: course.id },
        });
      }
    }
  }

  // ── 5. Docentes ───────────────────────────────────────────────────────────

  const teacherData = [
    {
      email: "mtra.gonzalez@normales.com",
      name: "María Elena",
      lastName: "González Vargas",
      employeeId: "BECENM-001",
      department: "Formación Docente",
    },
    {
      email: "mtro.hernandez@normales.com",
      name: "Roberto",
      lastName: "Hernández Jiménez",
      employeeId: "BECENM-002",
      department: "Ciencias de la Educación",
    },
    {
      email: "mtra.sanchez@normales.com",
      name: "Patricia",
      lastName: "Sánchez Moreno",
      employeeId: "BECENM-003",
      department: "Educación Preescolar",
    },
  ];

  const createdTeachers: Awaited<ReturnType<typeof prisma.teacher.upsert>>[] = [];

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

  // ── 6. Ciclo escolar + periodos de evaluación ─────────────────────────────

  const schoolYear = await prisma.schoolYear.upsert({
    where: { id: "sy-2025-2026" },
    update: {},
    create: {
      id: "sy-2025-2026",
      name: "2025–2026",
      startDate: new Date("2025-08-18"),
      endDate: new Date("2026-06-30"),
      status: "ACTIVE",
    },
  });

  const evalPeriodsData = [
    { num: 1, name: "Primer Bimestre",  open: new Date("2025-09-29"), close: new Date("2025-10-10"), status: "CLOSED" },
    { num: 2, name: "Segundo Bimestre", open: new Date("2025-11-24"), close: new Date("2025-12-05"), status: "CLOSED" },
    { num: 3, name: "Tercer Bimestre",  open: new Date("2026-02-09"), close: new Date("2026-02-20"), status: "OPEN"   },
  ] as const;

  const createdEvalPeriods: Awaited<ReturnType<typeof prisma.evaluationPeriod.upsert>>[] = [];

  for (const ep of evalPeriodsData) {
    const period = await prisma.evaluationPeriod.upsert({
      where: {
        schoolYearId_evaluationNumber_isExtraordinary: {
          schoolYearId: schoolYear.id,
          evaluationNumber: ep.num,
          isExtraordinary: false,
        },
      },
      update: {},
      create: {
        id: cuid(),
        schoolYearId: schoolYear.id,
        name: ep.name,
        evaluationNumber: ep.num,
        isExtraordinary: false,
        status: ep.status,
        openDate: ep.open,
        closeDate: ep.close,
      },
    });
    createdEvalPeriods.push(period);
  }

  // ── 7. Grupos ─────────────────────────────────────────────────────────────

  const groupLEP1 = await prisma.group.upsert({
    where: {
      institutionId_name_schoolYearId: {
        institutionId: institution.id,
        name: "LEP-1A",
        schoolYearId: schoolYear.id,
      },
    },
    update: {},
    create: {
      id: cuid(),
      name: "LEP-1A",
      groupType: "CAREER_SEMESTER",
      semester: 1,
      careerId: careerLEP.id,
      institutionId: institution.id,
      schoolYearId: schoolYear.id,
    },
  });

  const groupLEPresc1 = await prisma.group.upsert({
    where: {
      institutionId_name_schoolYearId: {
        institutionId: institution.id,
        name: "LEPREESC-1A",
        schoolYearId: schoolYear.id,
      },
    },
    update: {},
    create: {
      id: cuid(),
      name: "LEPREESC-1A",
      groupType: "CAREER_SEMESTER",
      semester: 1,
      careerId: careerLEPresc.id,
      institutionId: institution.id,
      schoolYearId: schoolYear.id,
    },
  });

  const lepSem1Courses     = createdCourses.filter((c) => c.careerId === careerLEP.id     && c.semester === 1);
  const leprescSem1Courses = createdCourses.filter((c) => c.careerId === careerLEPresc.id && c.semester === 1);

  // Asignaturas → grupos
  for (const course of lepSem1Courses) {
    await prisma.groupCourse.upsert({
      where: { groupId_courseId: { groupId: groupLEP1.id, courseId: course.id } },
      update: {},
      create: { id: cuid(), groupId: groupLEP1.id, courseId: course.id },
    });
  }

  for (const course of leprescSem1Courses) {
    await prisma.groupCourse.upsert({
      where: { groupId_courseId: { groupId: groupLEPresc1.id, courseId: course.id } },
      update: {},
      create: { id: cuid(), groupId: groupLEPresc1.id, courseId: course.id },
    });
  }

  // Docentes → grupos (titular por asignatura)
  const teacherAssignments: { teacherIdx: number; groupId: string; courses: typeof lepSem1Courses }[] = [
    { teacherIdx: 0, groupId: groupLEP1.id,     courses: lepSem1Courses.slice(0, 2)     },
    { teacherIdx: 1, groupId: groupLEP1.id,     courses: lepSem1Courses.slice(2)        },
    { teacherIdx: 2, groupId: groupLEPresc1.id, courses: leprescSem1Courses             },
  ];

  for (const { teacherIdx, groupId, courses } of teacherAssignments) {
    const teacher = createdTeachers[teacherIdx];
    if (!teacher) continue;
    for (const course of courses) {
      await prisma.teacherGroup.upsert({
        where: {
          teacherId_groupId_courseId: { teacherId: teacher.id, groupId, courseId: course.id },
        },
        update: {},
        create: {
          id: cuid(),
          teacherId: teacher.id,
          groupId,
          courseId: course.id,
          role: "TITULAR",
        },
      });
    }
  }

  // ── 8. Normalistas (alumnos) ──────────────────────────────────────────────

  const studentData = [
    // LEP
    { email: "sofia.reyes@normales.com",    name: "Sofía",    lastName: "Reyes Contreras",   enrollmentId: "2025-LEP-001", curp: "RECS050312MMCYNSF5", birthDay: new Date("2005-03-12"), careerId: careerLEP.id,     groupId: groupLEP1.id     },
    { email: "diana.luna@normales.com",     name: "Diana",    lastName: "Luna Espinoza",      enrollmentId: "2025-LEP-002", curp: "LUED060820MMCNSNB4", birthDay: new Date("2006-08-20"), careerId: careerLEP.id,     groupId: groupLEP1.id     },
    { email: "carlos.mendoza@normales.com", name: "Carlos",   lastName: "Mendoza Ríos",       enrollmentId: "2025-LEP-003", curp: "MERC050605HMCSNRA2", birthDay: new Date("2005-06-05"), careerId: careerLEP.id,     groupId: groupLEP1.id     },
    { email: "ivan.gutierrez@normales.com", name: "Iván",     lastName: "Gutiérrez Flores",   enrollmentId: "2025-LEP-004", curp: "GUFI060114HMCTLVB1", birthDay: new Date("2006-01-14"), careerId: careerLEP.id,     groupId: groupLEP1.id     },
    // LEPREESC
    { email: "paola.torres@normales.com",   name: "Paola",    lastName: "Torres Vázquez",     enrollmentId: "2025-LEPREESC-001", curp: "TOVP060930MMCRZLA3", birthDay: new Date("2006-09-30"), careerId: careerLEPresc.id, groupId: groupLEPresc1.id },
    { email: "lucia.morales@normales.com",  name: "Lucía",    lastName: "Morales Castillo",   enrollmentId: "2025-LEPREESC-002", curp: "MOCL050422MMCRSCA8", birthDay: new Date("2005-04-22"), careerId: careerLEPresc.id, groupId: groupLEPresc1.id },
    { email: "andrea.silva@normales.com",   name: "Andrea",   lastName: "Silva Pedraza",      enrollmentId: "2025-LEPREESC-003", curp: "SIPA061205MMCLNDB9", birthDay: new Date("2006-12-05"), careerId: careerLEPresc.id, groupId: groupLEPresc1.id },
  ];

  // Período cerrado más reciente para calificaciones
  const gradingPeriod = createdEvalPeriods[1]!; // Segundo Bimestre (CLOSED)

  for (const s of studentData) {
    // User
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
    });

    // Account — campos exactos del modelo Account
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
    });

    // Student
    const student = await prisma.student.upsert({
      where: { enrollmentId: s.enrollmentId },
      update: {},
      create: {
        id: cuid(),
        enrollmentId: s.enrollmentId,
        curp: s.curp,
        birthDay: s.birthDay,
        status: "REGULAR",
        userId: sUser.id,
        institutionId: institution.id,
        careerId: s.careerId,
        currentSemester: 1,
      },
    });

    // Grupo
    await prisma.studentGroup.upsert({
      where: { studentId_groupId: { studentId: student.id, groupId: s.groupId } },
      update: {},
      create: { id: cuid(), studentId: student.id, groupId: s.groupId },
    });

    // Inscripciones en asignaturas de 1er semestre
    const sem1Courses = s.careerId === careerLEP.id ? lepSem1Courses : leprescSem1Courses;

    for (const course of sem1Courses) {
      const enrollment = await prisma.enrollment.upsert({
        where: {
          studentId_courseId_schoolYearId: {
            studentId: student.id,
            courseId: course.id,
            schoolYearId: schoolYear.id,
          },
        },
        update: {},
        create: {
          id: cuid(),
          studentId: student.id,
          courseId: course.id,
          groupId: s.groupId,
          schoolYearId: schoolYear.id,
          status: "ENROLLED",
        },
      });

      const units = await prisma.unit.findMany({ where: { courseId: course.id } });

      // Una calificación ordinaria por unidad (constraint unique: enrollmentId+unitId+gradeType)
      for (const unit of units) {
        const grade = parseFloat((7 + Math.random() * 3).toFixed(1)); // 7.0–10.0
        await prisma.unitGrade.upsert({
          where: {
            enrollmentId_unitId_gradeType: {
              enrollmentId: enrollment.id,
              unitId: unit.id,
              gradeType: "ORDINARY",
            },
          },
          update: {},
          create: {
            id: cuid(),
            enrollmentId: enrollment.id,
            unitId: unit.id,
            evaluationPeriodId: gradingPeriod.id,
            grade,
            gradeType: "ORDINARY",
          },
        });
      }
    }
  }

  console.log("✅ Siembra completa.");
  console.log("\nContraseña de todos los usuarios: password123");
  console.log("\nUsuarios creados:");
  console.log("  ADMIN        admin@normales.com");
  console.log("  INSTITUCIÓN  direccion@normales.com");
  console.log("  DOCENTES     mtra.gonzalez@normales.com");
  console.log("               mtro.hernandez@normales.com");
  console.log("               mtra.sanchez@normales.com");
  console.log("  ALUMNOS LEP  sofia.reyes@normales.com   diana.luna@normales.com");
  console.log("               carlos.mendoza@normales.com ivan.gutierrez@normales.com");
  console.log("  ALUMNOS LEPREESC  paola.torres@normales.com  lucia.morales@normales.com");
  console.log("                    andrea.silva@normales.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
