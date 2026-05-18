import { Pool }
from 'pg'

import bcrypt
from 'bcryptjs'

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

    max: 20,

    idleTimeoutMillis:
      30000,

    connectionTimeoutMillis:
      2000,
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

    const userResult =
      await pool.query(

        `
        SELECT *
        FROM users
        WHERE email = $1
        LIMIT 1
        `,

        [email]
      )

    if (
      userResult.rows.length === 0
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid email or password',
      })
    }

    const user =
      userResult.rows[0]

    const validPassword =
      await bcrypt.compare(

        password,

        user.password
      )

    if (
      !validPassword
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid email or password',
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
        'Login failed',
    })
  }
}