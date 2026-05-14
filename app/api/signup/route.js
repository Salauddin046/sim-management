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

    const {
      name,
      email,
      username,
      password,
    } = body

    const existing = await pool.query(
      `
      SELECT *
      FROM users
      WHERE username = $1
      OR email = $2
      `,
      [username, email]
    )

    if (existing.rows.length > 0) {
      return Response.json(
        {
          error:
            'Username or email already exists',
        },
        {
          status: 400,
        }
      )
    }

    await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        username,
        password,
        approved
      )
      VALUES ($1, $2, $3, $4, FALSE)
      `,
      [
        name,
        email,
        username,
        password,
      ]
    )

    const approveLink =
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?username=${username}`

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject:
        'New User Approval Request',
      html: `
        <h2>New User Signup</h2>

        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Username:</b> ${username}</p>

        <a href="${approveLink}"
           style="
             background:black;
             color:white;
             padding:12px 20px;
             text-decoration:none;
             border-radius:6px;
             display:inline-block;
           ">
           Approve User
        </a>
      `,
    })

    return Response.json({
      message:
        'Signup request sent to admin',
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'Signup failed',
      },
      {
        status: 500,
      }
    )
  }
}