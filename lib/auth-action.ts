import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { z, ZodTypeAny } from "zod"

type BetterAuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

type AuthActionHandler<TInput, TOutput> = (
    input: TInput,
    session: BetterAuthSession
) => Promise<TOutput>

/**
 * Higher-Order Function that wraps a server action with authentication.
 *
 * - Calls Better Auth's getSession() to retrieve the current session from the request.
 * - Throws "Unauthorized" if no valid session exists.
 * - Optionally parses and validates input using a Zod schema before passing
 *   to the handler, avoiding manual type-casting in consumers.
 *
 * Usage (without schema):
 *   export const myAction = authAction(null, async (input, session) => { ... })
 *
 * Usage (with schema):
 *   const schema = z.object({ name: z.string() })
 *   export const myAction = authAction(schema, async (input, session) => { ... })
 */
export function authAction<TSchema extends ZodTypeAny, TOutput>(
    schema: TSchema,
    handler: AuthActionHandler<z.infer<TSchema>, TOutput>
): (input: z.infer<TSchema>) => Promise<TOutput>

export function authAction<TOutput>(
    schema: null,
    handler: AuthActionHandler<undefined, TOutput>
): () => Promise<TOutput>

export function authAction<TSchema extends ZodTypeAny | null, TOutput>(
    schema: TSchema,
    handler: (input: TSchema extends ZodTypeAny ? z.infer<TSchema> : undefined, session: BetterAuthSession) => Promise<TOutput>
) {
    return async (rawInput?: unknown): Promise<TOutput> => {
        const session = await auth.api.getSession({ headers: await headers() })

        if (!session?.user) {
            throw new Error("Unauthorized")
        }

        if (schema !== null) {
            const result = (schema as ZodTypeAny).safeParse(rawInput)
            if (!result.success) {
                throw new Error(`Validation error: ${result.error.message}`)
            }
            return handler(result.data, session)
        }

        return handler(undefined as TSchema extends ZodTypeAny ? z.infer<TSchema> : undefined, session)
    }
}
