"use server"

import db from "@/lib/db"
import { authAction } from "@/lib/auth-action"
import { z } from "zod"

export const getCareerById = authAction(z.object({ id: z.string() }), async ({ id }) => {
    const { rows } = await db.query(`SELECT * FROM "Career" WHERE id = $1`, [id])
    if (rows.length === 0) return null
    const career = rows[0]

    const [{ rows: courses }, { rows: groups }] = await Promise.all([
        db.query(
            `SELECT * FROM "Course" WHERE "careerId" = $1 AND "deletedAt" IS NULL ORDER BY semester ASC NULLS LAST, name ASC`,
            [id],
        ),
        db.query(
            `SELECT g.*, (SELECT COUNT(*) FROM "StudentGroup" sg WHERE sg."groupId" = g.id)::int AS student_count
             FROM "Group" g WHERE g."careerId" = $1 AND g."deletedAt" IS NULL`,
            [id],
        ),
    ])

    const studentCount = await db.query(
        `SELECT COUNT(*)::int AS cnt FROM "Student" WHERE "careerId" = $1 AND "deletedAt" IS NULL`, [id],
    )

    return {
        ...career,
        courses,
        groups: groups.map((g) => ({ ...g, _count: { studentGroups: g.student_count } })),
        _count: { students: studentCount.rows[0].cnt, courses: courses.length },
    }
})
