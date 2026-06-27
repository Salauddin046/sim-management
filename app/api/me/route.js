import { getSession } from '@/lib/auth'

export async function GET(request) {
  const session = await getSession(request)
  if (!session) {
    return Response.json({ success: false }, { status: 401 })
  }
  return Response.json({ success: true, user: session })
}
