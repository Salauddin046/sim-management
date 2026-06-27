import { getSession } from '@/lib/auth'

export async function POST(req) {
  const session = await getSession(req)
  if (!session) {
    return Response.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const searches = body.searches || []

    if (searches.length === 0) {
      return Response.json(
        { success: false, message: 'No search values' },
        { status: 400 }
      )
    }

    if (searches.length > 500) {
      return Response.json(
        { success: false, message: 'Maximum 500 searches allowed' },
        { status: 400 }
      )
    }

    const airtelAuth = process.env.AIRTEL_API_AUTH
    if (!airtelAuth) {
      return Response.json(
        { success: false, message: 'API configuration missing' },
        { status: 500 }
      )
    }

    const requests = searches.map(async (search) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)

        const response = await fetch(
          'https://airtelsim.intellicar.in/api/v1/airtel/details',
          {
            method: 'POST',
            signal: controller.signal,
            headers: {
              accept: 'application/json, text/plain, */*',
              authorization: `Basic ${airtelAuth}`,
              'content-type': 'application/json',
              origin: 'https://airtelsim.intellicar.in',
              referer: 'https://airtelsim.intellicar.in/debugger',
              'user-agent': 'Mozilla/5.0',
            },
            body: JSON.stringify({ type: 'SIMNO', id: search, accounttype: '1-28' }),
          }
        )

        clearTimeout(timeout)

        if (!response.ok) return { sims: [], deviceInfo: [] }

        const apiResponse = await response.json()
        return {
          sims: apiResponse?.data?.sims || [],
          deviceInfo: apiResponse?.data?.deviceInfo || [],
        }
      } catch {
        return { sims: [], deviceInfo: [] }
      }
    })

    const results = await Promise.all(requests)
    return Response.json({ success: true, results })
  } catch (error) {
    return Response.json(
      { success: false, message: 'Bulk search failed' },
      { status: 500 }
    )
  }
}
