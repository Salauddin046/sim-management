import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const globalForPool =
  global

const pool =
  globalForPool.pool ||

  new Pool({

    connectionString:
      process.env.DATABASE_URL,

    ssl: {
      rejectUnauthorized: false,
    },
  })

if (
  !globalForPool.pool
) {

  globalForPool.pool =
    pool
}

export async function POST(req) {

  try {

    const body =
      await req.json()

    const {
      email,
      password,
    } = body

    console.log(
      'LOGIN BODY:',
      body
    )

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

    const result =
      await pool.query(

        `
        SELECT *
        FROM users
        WHERE email = $1
        LIMIT 1
        `,

        [email]
      )

    console.log(
      'DB RESULT:',
      result.rows
    )

    if (
      result.rows.length === 0
    ) {

      return Response.json({

        success: false,

        message:
          'User not found',
      })
    }

    const user =
      result.rows[0]

    const validPassword =
      await bcrypt.compare(

        password,

        user.password
      )

    console.log(
      'PASSWORD MATCH:',
      validPassword
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

      user: {

        id:
          user.id,

        name:
          user.name,

        email:
          user.email,
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
        error.message,
    })
  }
}