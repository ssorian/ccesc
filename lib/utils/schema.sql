-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.AcademicHistory (
  id text NOT NULL,
  studentId text NOT NULL,
  courseId text NOT NULL,
  courseName text NOT NULL,
  courseCode text NOT NULL,
  courseCredits double precision NOT NULL,
  schoolYearName text NOT NULL,
  semester integer NOT NULL,
  finalGrade double precision NOT NULL,
  passed boolean NOT NULL,
  status USER-DEFINED NOT NULL,
  wasExtraordinary boolean NOT NULL DEFAULT false,
  globalEvaluationGrade double precision,
  unitsAverage double precision NOT NULL,
  unitGradesDetail jsonb,
  attendancePercentage double precision,
  notes text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT AcademicHistory_pkey PRIMARY KEY (id),
  CONSTRAINT AcademicHistory_studentId_fkey FOREIGN KEY (studentId) REFERENCES public.Student(id),
  CONSTRAINT AcademicHistory_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.Account (
  id text NOT NULL,
  accountId text NOT NULL,
  providerId text NOT NULL,
  userId text NOT NULL,
  accessToken text,
  refreshToken text,
  idToken text,
  accessTokenExpiresAt timestamp without time zone,
  refreshTokenExpiresAt timestamp without time zone,
  scope text,
  password text,
  createdAt timestamp without time zone NOT NULL,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Account_pkey PRIMARY KEY (id),
  CONSTRAINT Account_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Applicant (
  id text NOT NULL,
  name text NOT NULL,
  lastName text NOT NULL,
  email text NOT NULL,
  curp text NOT NULL,
  age integer NOT NULL,
  phone text,
  state text NOT NULL,
  municipality text NOT NULL,
  neighborhood text NOT NULL,
  street text NOT NULL,
  number text NOT NULL,
  institutionCareerId text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::"ApplicantStatus",
  studentId text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Applicant_pkey PRIMARY KEY (id),
  CONSTRAINT Applicant_institutionCareerId_fkey FOREIGN KEY (institutionCareerId) REFERENCES public.InstitutionCareer(id),
  CONSTRAINT Applicant_studentId_fkey FOREIGN KEY (studentId) REFERENCES public.Student(id)
);
CREATE TABLE public.Attendance (
  id text NOT NULL,
  enrollmentId text NOT NULL,
  unitId text NOT NULL,
  sessionDate timestamp without time zone NOT NULL,
  present boolean NOT NULL DEFAULT false,
  justified boolean NOT NULL DEFAULT false,
  registeredById text NOT NULL,
  notes text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Attendance_pkey PRIMARY KEY (id),
  CONSTRAINT Attendance_enrollmentId_fkey FOREIGN KEY (enrollmentId) REFERENCES public.Enrollment(id),
  CONSTRAINT Attendance_unitId_fkey FOREIGN KEY (unitId) REFERENCES public.Unit(id),
  CONSTRAINT Attendance_registeredById_fkey FOREIGN KEY (registeredById) REFERENCES public.Teacher(id)
);
CREATE TABLE public.Career (
  id text NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  totalSemesters integer NOT NULL DEFAULT 8,
  deletedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Career_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Course (
  id text NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  credits double precision NOT NULL,
  hours integer NOT NULL,
  courseType USER-DEFINED NOT NULL DEFAULT 'EXCLUSIVE'::"CourseType",
  evaluationCount integer NOT NULL DEFAULT 3,
  minUnits integer NOT NULL DEFAULT 2,
  careerId text,
  semester integer,
  deletedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Course_pkey PRIMARY KEY (id),
  CONSTRAINT Course_careerId_fkey FOREIGN KEY (careerId) REFERENCES public.Career(id)
);
CREATE TABLE public.CoursePrerequisite (
  id text NOT NULL,
  courseId text NOT NULL,
  prerequisiteId text NOT NULL,
  CONSTRAINT CoursePrerequisite_pkey PRIMARY KEY (id),
  CONSTRAINT CoursePrerequisite_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id),
  CONSTRAINT CoursePrerequisite_prerequisiteId_fkey FOREIGN KEY (prerequisiteId) REFERENCES public.Course(id)
);
CREATE TABLE public.Enrollment (
  id text NOT NULL,
  studentId text NOT NULL,
  courseId text NOT NULL,
  groupId text,
  schoolYearId text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'ENROLLED'::"EnrollmentStatus",
  globalEvaluationGrade double precision,
  unitsAverage double precision,
  finalGrade double precision,
  deletedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Enrollment_pkey PRIMARY KEY (id),
  CONSTRAINT Enrollment_studentId_fkey FOREIGN KEY (studentId) REFERENCES public.Student(id),
  CONSTRAINT Enrollment_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id),
  CONSTRAINT Enrollment_groupId_fkey FOREIGN KEY (groupId) REFERENCES public.Group(id),
  CONSTRAINT Enrollment_schoolYearId_fkey FOREIGN KEY (schoolYearId) REFERENCES public.SchoolYear(id)
);
CREATE TABLE public.EnrollmentRequirement (
  id text NOT NULL,
  groupId text NOT NULL,
  minSemester integer,
  careerId text,
  maxCapacity integer,
  enrollmentStart timestamp without time zone,
  enrollmentEnd timestamp without time zone,
  isOpen boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT EnrollmentRequirement_pkey PRIMARY KEY (id),
  CONSTRAINT EnrollmentRequirement_groupId_fkey FOREIGN KEY (groupId) REFERENCES public.Group(id)
);
CREATE TABLE public.EvaluationPeriod (
  id text NOT NULL,
  schoolYearId text NOT NULL,
  name text NOT NULL,
  evaluationNumber integer NOT NULL,
  isExtraordinary boolean NOT NULL DEFAULT false,
  status USER-DEFINED NOT NULL DEFAULT 'SCHEDULED'::"EvaluationPeriodStatus",
  openDate timestamp without time zone,
  closeDate timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT EvaluationPeriod_pkey PRIMARY KEY (id),
  CONSTRAINT EvaluationPeriod_schoolYearId_fkey FOREIGN KEY (schoolYearId) REFERENCES public.SchoolYear(id)
);
CREATE TABLE public.EvaluationPeriodAuditLog (
  id text NOT NULL,
  evaluationPeriodId text NOT NULL,
  modifiedById text NOT NULL,
  previousStatus USER-DEFINED NOT NULL,
  newStatus USER-DEFINED NOT NULL,
  reason text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT EvaluationPeriodAuditLog_pkey PRIMARY KEY (id),
  CONSTRAINT EvaluationPeriodAuditLog_evaluationPeriodId_fkey FOREIGN KEY (evaluationPeriodId) REFERENCES public.EvaluationPeriod(id)
);
CREATE TABLE public.Group (
  id text NOT NULL,
  name text NOT NULL,
  groupType USER-DEFINED NOT NULL,
  semester integer,
  careerId text,
  institutionId text NOT NULL,
  schoolYearId text NOT NULL,
  deletedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Group_pkey PRIMARY KEY (id),
  CONSTRAINT Group_careerId_fkey FOREIGN KEY (careerId) REFERENCES public.Career(id),
  CONSTRAINT Group_institutionId_fkey FOREIGN KEY (institutionId) REFERENCES public.Institution(id),
  CONSTRAINT Group_schoolYearId_fkey FOREIGN KEY (schoolYearId) REFERENCES public.SchoolYear(id)
);
CREATE TABLE public.GroupCourse (
  id text NOT NULL,
  groupId text NOT NULL,
  courseId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT GroupCourse_pkey PRIMARY KEY (id),
  CONSTRAINT GroupCourse_groupId_fkey FOREIGN KEY (groupId) REFERENCES public.Group(id),
  CONSTRAINT GroupCourse_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.Institution (
  id text NOT NULL,
  userId text NOT NULL,
  slug text NOT NULL,
  address text,
  enableGlobalEvaluation boolean NOT NULL DEFAULT false,
  globalEvaluationWeight double precision NOT NULL DEFAULT 0.4,
  deletedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Institution_pkey PRIMARY KEY (id),
  CONSTRAINT Institution_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.InstitutionCareer (
  id text NOT NULL,
  institutionId text NOT NULL,
  careerId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT InstitutionCareer_pkey PRIMARY KEY (id),
  CONSTRAINT InstitutionCareer_institutionId_fkey FOREIGN KEY (institutionId) REFERENCES public.Institution(id),
  CONSTRAINT InstitutionCareer_careerId_fkey FOREIGN KEY (careerId) REFERENCES public.Career(id)
);
CREATE TABLE public.InstitutionOptionalCourse (
  id text NOT NULL,
  institutionId text NOT NULL,
  courseId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT InstitutionOptionalCourse_pkey PRIMARY KEY (id),
  CONSTRAINT InstitutionOptionalCourse_institutionId_fkey FOREIGN KEY (institutionId) REFERENCES public.Institution(id),
  CONSTRAINT InstitutionOptionalCourse_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.PromotionRecord (
  id text NOT NULL,
  studentId text NOT NULL,
  schoolYearId text NOT NULL,
  fromSemester integer NOT NULL,
  toSemester integer,
  status USER-DEFINED NOT NULL,
  failedCourses integer NOT NULL DEFAULT 0,
  notes text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT PromotionRecord_pkey PRIMARY KEY (id),
  CONSTRAINT PromotionRecord_studentId_fkey FOREIGN KEY (studentId) REFERENCES public.Student(id),
  CONSTRAINT PromotionRecord_schoolYearId_fkey FOREIGN KEY (schoolYearId) REFERENCES public.SchoolYear(id)
);
CREATE TABLE public.SchoolYear (
  id text NOT NULL,
  name text NOT NULL,
  startDate timestamp without time zone NOT NULL,
  endDate timestamp without time zone NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PLANNED'::"SchoolYearStatus",
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT SchoolYear_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Session (
  id text NOT NULL,
  expiresAt timestamp without time zone NOT NULL,
  token text NOT NULL,
  createdAt timestamp without time zone NOT NULL,
  updatedAt timestamp without time zone NOT NULL,
  ipAddress text,
  userAgent text,
  userId text NOT NULL,
  CONSTRAINT Session_pkey PRIMARY KEY (id),
  CONSTRAINT Session_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Student (
  id text NOT NULL,
  enrollmentId text NOT NULL,
  curp text NOT NULL,
  birthDay timestamp without time zone NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'REGULAR'::"StudentStatus",
  phone text,
  state text,
  municipality text,
  neighborhood text,
  street text,
  number text,
  userId text NOT NULL,
  institutionId text NOT NULL,
  careerId text,
  currentSemester integer NOT NULL DEFAULT 1,
  failedCourseCount integer NOT NULL DEFAULT 0,
  deletedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Student_pkey PRIMARY KEY (id),
  CONSTRAINT Student_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT Student_institutionId_fkey FOREIGN KEY (institutionId) REFERENCES public.Institution(id),
  CONSTRAINT Student_careerId_fkey FOREIGN KEY (careerId) REFERENCES public.Career(id)
);
CREATE TABLE public.StudentGroup (
  id text NOT NULL,
  studentId text NOT NULL,
  groupId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT StudentGroup_pkey PRIMARY KEY (id),
  CONSTRAINT StudentGroup_studentId_fkey FOREIGN KEY (studentId) REFERENCES public.Student(id),
  CONSTRAINT StudentGroup_groupId_fkey FOREIGN KEY (groupId) REFERENCES public.Group(id)
);
CREATE TABLE public.SystemAuditLog (
  id text NOT NULL,
  userId text NOT NULL,
  institutionId text,
  action text NOT NULL,
  entityType text NOT NULL,
  entityId text NOT NULL,
  metadata jsonb,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT SystemAuditLog_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Teacher (
  id text NOT NULL,
  employeeId text NOT NULL,
  department text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'ACTIVE'::"TeacherStatus",
  userId text NOT NULL,
  institutionId text NOT NULL,
  deletedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Teacher_pkey PRIMARY KEY (id),
  CONSTRAINT Teacher_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT Teacher_institutionId_fkey FOREIGN KEY (institutionId) REFERENCES public.Institution(id)
);
CREATE TABLE public.TeacherGroup (
  id text NOT NULL,
  teacherId text NOT NULL,
  groupId text NOT NULL,
  courseId text,
  role text NOT NULL DEFAULT 'TITULAR'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT TeacherGroup_pkey PRIMARY KEY (id),
  CONSTRAINT TeacherGroup_teacherId_fkey FOREIGN KEY (teacherId) REFERENCES public.Teacher(id),
  CONSTRAINT TeacherGroup_groupId_fkey FOREIGN KEY (groupId) REFERENCES public.Group(id),
  CONSTRAINT TeacherGroup_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.Unit (
  id text NOT NULL,
  name text NOT NULL,
  unitNumber integer NOT NULL,
  description text,
  weight double precision NOT NULL DEFAULT 1.0,
  lockedAt timestamp without time zone,
  courseId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Unit_pkey PRIMARY KEY (id),
  CONSTRAINT Unit_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.UnitGrade (
  id text NOT NULL,
  enrollmentId text NOT NULL,
  unitId text NOT NULL,
  evaluationPeriodId text,
  grade double precision,
  gradeType USER-DEFINED NOT NULL DEFAULT 'ORDINARY'::"GradeType",
  assignedById text,
  comments text,
  version integer NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT UnitGrade_pkey PRIMARY KEY (id),
  CONSTRAINT UnitGrade_enrollmentId_fkey FOREIGN KEY (enrollmentId) REFERENCES public.Enrollment(id),
  CONSTRAINT UnitGrade_unitId_fkey FOREIGN KEY (unitId) REFERENCES public.Unit(id),
  CONSTRAINT UnitGrade_evaluationPeriodId_fkey FOREIGN KEY (evaluationPeriodId) REFERENCES public.EvaluationPeriod(id),
  CONSTRAINT UnitGrade_assignedById_fkey FOREIGN KEY (assignedById) REFERENCES public.Teacher(id)
);
CREATE TABLE public.UnitGradeAuditLog (
  id text NOT NULL,
  unitGradeId text NOT NULL,
  oldGrade double precision,
  newGrade double precision,
  userId text,
  reason text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT UnitGradeAuditLog_pkey PRIMARY KEY (id),
  CONSTRAINT UnitGradeAuditLog_unitGradeId_fkey FOREIGN KEY (unitGradeId) REFERENCES public.UnitGrade(id)
);
CREATE TABLE public.User (
  id text NOT NULL,
  name text NOT NULL,
  lastName text,
  email text NOT NULL,
  emailVerified boolean NOT NULL,
  image text,
  role USER-DEFINED NOT NULL DEFAULT 'STUDENT'::"UserRole",
  institutionId text,
  deletedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT User_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Verification (
  id text NOT NULL,
  identifier text NOT NULL,
  value text NOT NULL,
  expiresAt timestamp without time zone NOT NULL,
  createdAt timestamp without time zone,
  updatedAt timestamp without time zone,
  CONSTRAINT Verification_pkey PRIMARY KEY (id)
);
CREATE TABLE public._prisma_migrations (
  id character varying NOT NULL,
  checksum character varying NOT NULL,
  finished_at timestamp with time zone,
  migration_name character varying NOT NULL,
  logs text,
  rolled_back_at timestamp with time zone,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  applied_steps_count integer NOT NULL DEFAULT 0,
  CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id)
);
