import { Pool } from 'pg'

import bcrypt from 'bcryptjs'

const pool =
  new Pool({

    connectionString:
      process.env.DATABASE_URL,

    ssl: {
      rejectUnauthorized: false,
    },
  })

export async function POST(req) {

  try {

    const body =
      await req.json()

    const {
      email,
      password,
    } = body

    if (
      !email ||
      !password
    ) {

      return Response.json({

        success: false,

        message:
          'Email and password required',
      })
    }

    const user =
      await pool.query(

        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
      )

    if (
      user.rows.length === 0
    ) {

      return Response.json({

        success: false,

        message:
          'User not found',
      })
    }

    const dbUser =
      user.rows[0]

    const validPassword =
      await bcrypt.compare(
        password,
        dbUser.password
      )

    if (
      !validPassword
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid password',
      })
    }

    return Response.json({

      success: true,

      message:
        'Login successful',

      user: {

        id:
          dbUser.id,

        name:
          dbUser.name,

        email:
          dbUser.email,
      },
    })

  } catch (error) {

    console.log(
      'LOGIN ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        'Login failed',
    })
  }
}