import { Pool } from 'pg'

import bcrypt
from 'bcryptjs'

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

    let {
      name,
      email,
      password,
    } = body

    name =
      String(name).trim()

    email =
      String(email)
        .trim()
        .toLowerCase()

    password =
      String(password).trim()

    // VALIDATION

    if (
      !name
      ||
      !email
      ||
      !password
    ) {

      return Response.json({

        success: false,

        message:
          'All fields required',
      })
    }

    // CHECK USER

    const existingUser =
      await pool.query(

        `
        SELECT *
        FROM users

        WHERE email = $1
        `,

        [email]
      )

    if (
      existingUser.rows.length > 0
    ) {

      return Response.json({

        success: false,

        message:
          'Email already exists',
      })
    }

    // HASH PASSWORD

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      )

    // INSERT USER

    await pool.query(

      `
      INSERT INTO users (

        name,
        email,
        password

      )

      VALUES ($1,$2,$3)
      `,

      [
        name,
        email,
        hashedPassword,
      ]
    )

    return Response.json({

      success: true,

      message:
        'Signup successful',
    })

  } catch (error) {

    console.log(
      'SIGNUP ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        'Signup failed',
    })
  }
}