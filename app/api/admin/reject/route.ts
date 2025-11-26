import { NextRequest, NextResponse } from 'next/server'
import { rejectBonfire } from '@/lib/azure-table'

export async function POST(request: NextRequest) {
  try {
    // Sjekk autentisering
    const adminSession = request.cookies.get('admin_session')

    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Ikke autorisert' },
        { status: 401 }
      )
    }

    const { rowKey } = await request.json()

    if (!rowKey) {
      return NextResponse.json(
        { error: 'rowKey mangler' },
        { status: 400 }
      )
    }

    await rejectBonfire(rowKey)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Feil ved avslag av innmelding:', error)
    return NextResponse.json(
      { error: 'Kunne ikke avslå innmelding', details: error.message },
      { status: 500 }
    )
  }
}
