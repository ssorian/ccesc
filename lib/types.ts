// Enums mirroring prisma/schema.prisma — source of truth for the DB schema
// Use these instead of importing from @prisma/generated/client

export const UserRole = {
    ADMIN: "ADMIN",
    INSTITUTION: "INSTITUTION",
    TEACHER: "TEACHER",
    STUDENT: "STUDENT",
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const StudentStatus = {
    REGULAR: "REGULAR",
    FAILED: "FAILED",
    DROPOUT: "DROPOUT",
    TEMPORARY_LEAVE: "TEMPORARY_LEAVE",
    GRADUATED: "GRADUATED",
} as const
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus]

export const TeacherStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
} as const
export type TeacherStatus = (typeof TeacherStatus)[keyof typeof TeacherStatus]

export const CourseType = {
    EXCLUSIVE: "EXCLUSIVE",
    FREE: "FREE",
} as const
export type CourseType = (typeof CourseType)[keyof typeof CourseType]

export const GroupType = {
    CAREER_SEMESTER: "CAREER_SEMESTER",
    WORKSHOP: "WORKSHOP",
    INDIVIDUAL: "INDIVIDUAL",
} as const
export type GroupType = (typeof GroupType)[keyof typeof GroupType]

export const ApplicantStatus = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
} as const
export type ApplicantStatus = (typeof ApplicantStatus)[keyof typeof ApplicantStatus]

export const GradeType = {
    ORDINARY: "ORDINARY",
    EXTRAORDINARY: "EXTRAORDINARY",
} as const
export type GradeType = (typeof GradeType)[keyof typeof GradeType]

export const EvaluationPeriodStatus = {
    SCHEDULED: "SCHEDULED",
    OPEN: "OPEN",
    CLOSED: "CLOSED",
} as const
export type EvaluationPeriodStatus = (typeof EvaluationPeriodStatus)[keyof typeof EvaluationPeriodStatus]

export const EnrollmentStatus = {
    ENROLLED: "ENROLLED",
    PASSED: "PASSED",
    FAILED: "FAILED",
} as const
export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus]

export const SchoolYearStatus = {
    PLANNED: "PLANNED",
    ACTIVE: "ACTIVE",
    CLOSED: "CLOSED",
} as const
export type SchoolYearStatus = (typeof SchoolYearStatus)[keyof typeof SchoolYearStatus]

export const PromotionStatus = {
    PROMOTED: "PROMOTED",
    PROMOTED_WITH_DEBT: "PROMOTED_WITH_DEBT",
    RETAINED: "RETAINED",
    PENDING: "PENDING",
} as const
export type PromotionStatus = (typeof PromotionStatus)[keyof typeof PromotionStatus]
