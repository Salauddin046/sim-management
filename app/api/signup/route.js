import { Pool } from 'pg'
import nodemailer from 'nodemailer'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(req) {
  try {
    const body = await req.json()

    const { username, password } = body

    const existing = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    if (existing.rows.length > 0) {
      return Response.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    await pool.query(
      `
      INSERT INTO users (
        username,
        password,
        approved
      )
      VALUES ($1, $2, FALSE)
      `,
      [username, password]
    )

    const approveLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?username=${username}`

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New User Signup Approval',
      html: `
        <h2>New User Signup Request</h2>

        <p><strong>Username:</strong> ${username}</p>

        <a href="${approveLink}"
           style="
             display:inline-block;
             padding:12px 20px;
             background:black;
             color:white;
             text-decoration:none;
             border-radius:6px;
           ">
           Approve User
        </a>
      `,
    })

    return Response.json({
      message: 'Signup request sent to admin',
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      { error: 'Signup failed' },
      { status: 500 }
    )
  }
}