import { NextRequest, NextResponse } from 'next/server'
import { createBonfireInAzure } from '@/lib/azure-table'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Dette er en direkte innmelding med formdata
    const {
      navn,
      telefon,
      epost,
      adresse,
      kommune,
      latitude,
      longitude,
      balstorrelse,
      type,
      fra,
      til,
      beskrivelse
    } = body

    // Valider at påkrevde felter er tilstede
    if (!navn || !telefon || !adresse || !kommune) {
      return NextResponse.json(
        { error: 'Påkrevde felter mangler' },
        { status: 400 }
      )
    }

    // Lagre til Azure Table Storage
    try {
      const rowKey = await createBonfireInAzure({
        navn,
        telefon: telefon.toString(),
        epost: epost || '',
        adresse,
        kommune,
        latitude: latitude || 0,
        longitude: longitude || 0,
        balstorrelse: balstorrelse || 'Ikke oppgitt',
        type: type || 'Annet',
        fra: fra,
        til: til,
        beskrivelse: beskrivelse || 'Registrert via form'
      })

      console.log('✅ Innmelding lagret i Azure Tables! RowKey:', rowKey)

      return NextResponse.json({
        success: true,
        rowKey,
        message: 'Innmelding lagret!'
      })
    } catch (azureError) {
      console.error('❌ Feil ved lagring til Azure Tables:', azureError)
      return NextResponse.json(
        {
          error: 'Kunne ikke lagre til Azure Table Storage',
          details: azureError instanceof Error ? azureError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Feil ved prosessering av forespørsel:', error)
    return NextResponse.json(
      { error: 'Ugyldig forespørsel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
