import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_USER
  const pass = process.env.BASIC_PASS

  // Allow local dev when no credentials are configured.
  // In production (Vercel), set BASIC_USER + BASIC_PASS to lock the subdomain.
  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Auth not configured', { status: 500 })
    }
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6))
      const idx = decoded.indexOf(':')
      const u = idx >= 0 ? decoded.slice(0, idx) : decoded
      const p = idx >= 0 ? decoded.slice(idx + 1) : ''
      if (u === user && p === pass) {
        return NextResponse.next()
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Private"' },
  })
}

export const config = {
  matcher: ['/((?!api/ingest|llms.txt|_next/static|_next/image|favicon.ico).*)'],
}
