import { Pool, PoolClient } from "pg"

const globalForDb = global as unknown as { db: Pool }

const db = globalForDb.db ?? new Pool({
    connectionString: process.env.DATABASE_URL,
})

if (process.env.NODE_ENV !== "production") globalForDb.db = db

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await db.connect()
    try {
        await client.query("BEGIN")
        const result = await fn(client)
        await client.query("COMMIT")
        return result
    } catch (err) {
        await client.query("ROLLBACK")
        throw err
    } finally {
        client.release()
    }
}

export default db
