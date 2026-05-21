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

    // CLEAN VALUES

    name =
      String(name)
        .trim()

    email =
      String(email)
        .trim()
        .toLowerCase()

    password =
      String(password)
        .trim()

    console.log({

      name,
      email,
      password,
    })

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
          'All fields are required',
      })
    }

    // CHECK EXISTING USER

    const existingUser =
      await pool.query(

        `
        SELECT *
        FROM users

        WHERE LOWER(email)
        =
        LOWER($1)
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

    console.log(
      'User Created Successfully'
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