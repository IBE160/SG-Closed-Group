import { NextRequest, NextResponse } from 'next/server'
import { getPendingBonfires } from '@/lib/azure-table'

export async function GET(request: NextRequest) {
  try {
    // Sjekk autentisering
    const adminSession = request.cookies.get('admin_session')

    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Ikke autorisert' },
        { status: 401 }
      )
    }

    // Hent alle ventende bålmeldinger fra Azure
    const pending = await getPendingBonfires()

    return NextResponse.json({ pending })
  } catch (error: any) {
    console.error('Feil ved henting av ventende innmeldinger:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente ventende innmeldinger', details: error.message },
      { status: 500 }
    )
  }
}
