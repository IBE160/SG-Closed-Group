import { NextRequest, NextResponse } from 'next/server'
import { getApprovedBonfires } from '@/lib/azure-table'

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

    // Hent kun godkjente bålmeldinger fra Azure
    const bonfires = await getApprovedBonfires()

    return NextResponse.json({ bonfires })
  } catch (error: any) {
    console.error('Feil ved henting av bålmeldinger:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente bålmeldinger', details: error.message },
      { status: 500 }
    )
  }
}
