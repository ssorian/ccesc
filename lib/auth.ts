import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { hash, compare } from "bcryptjs"

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true,
        password: {
            hash: (password) => hash(password, 10),
            verify: ({ hash: hashed, password }) => compare(password, hashed),
        },
    },
    user: {
        modelName: "User",
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "STUDENT",
            },
            lastName: {
                type: "string",
                required: false,
            },
            institutionId: {
                type: "string",
                required: false,
            },
        },
    },
    session: {
        modelName: "Session",
    },
    account: {
        modelName: "Account",
    },
    verification: {
        modelName: "Verification",
    },
})
