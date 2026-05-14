import { Pool } from 'pg'

    if (existing.rows.length > 0) {
      return Response.json(
        {
          error: 'Username or email already exists',
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

    const approveLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?username=${username}`

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New User Approval Request',
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
      {
        error: 'Signup failed',
      },
      {
        status: 500,
      }
    )
  }
}