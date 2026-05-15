import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const username = searchParams.get('username')

    if (!username) {
      return new Response('Invalid request')
    }

    await pool.query(
      `
      UPDATE users
      SET approved = TRUE
      WHERE username = $1
      `,
      [username]
    )

    return new Response(
      `
      <h1>User Approved Successfully</h1>
      <p>${username} can now login.</p>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error(error)

    return new Response('Approval failed')
  }
}