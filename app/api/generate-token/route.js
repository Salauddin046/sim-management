import crypto from 'crypto'

export async function GET() {

  try {

    const token =
      crypto
        .randomBytes(32)
        .toString('hex')

    return Response.json({

      success: true,

      token,
    })

  } catch (error) {

    console.log(error)

    return Response.json({

      success: false,

      message:
        'Token generation failed',
    })
  }
}