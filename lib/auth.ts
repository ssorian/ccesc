import { betterAuth } from "better-auth";
import { hash, compare } from "bcryptjs";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
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
});
