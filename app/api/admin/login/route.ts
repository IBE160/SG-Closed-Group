import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin-passord er ikke konfigurert' },
        { status: 500 }
      )
    }

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true })

      // Sett HTTP-only cookie som varer i 8 timer
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 timer
        path: '/',
      })

      return response
    } else {
      return NextResponse.json(
        { error: 'Feil passord' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Ugyldig forespørsel' },
      { status: 400 }
    )
  }
}
