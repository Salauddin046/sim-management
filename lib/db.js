import { Pool } from 'pg'

const globalForPool = global

const pool =
  globalForPool._pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

if (!globalForPool._pgPool) {
  globalForPool._pgPool = pool
}

export default pool
