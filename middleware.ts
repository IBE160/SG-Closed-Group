import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Sjekk om dette er en beskyttet admin-rute
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin'

  // Hvis det er login-siden, tillat alltid tilgang
  if (isLoginPage) {
    return NextResponse.next()
  }

  // For andre admin-ruter, sjekk autentisering
  if (isAdminRoute) {
    const adminSession = request.cookies.get('admin_session')

    if (!adminSession || adminSession.value !== 'authenticated') {
      // Omdiriger til login hvis ikke autentisert
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
