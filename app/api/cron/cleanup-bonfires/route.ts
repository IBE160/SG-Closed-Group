/**
 * Nattlig opprydding av bålmeldinger
 *
 * Denne ruten kjøres automatisk hver natt kl. 04:00 via Vercel Cron Jobs.
 * Sletter ALLE bålmeldinger fra Azure Table Storage for å rydde kartet
 * til nye meldinger neste dag.
 *
 * Sikkerhet: Krever CRON_SECRET header for å forhindre uautorisert tilgang.
 *
 * @see vercel.json for cron-konfigurasjon
 */

import { NextRequest, NextResponse } from 'next/server'
import { deleteAllBonfiresFromAzure } from '@/lib/azure-table'

export async function GET(request: NextRequest) {
  // Verifiser at forespørselen kommer fra Vercel Cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // I produksjon: Krev gyldig CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('⚠️ Uautorisert cron-forsøk')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('🌙 Starter nattlig opprydding av bålmeldinger...')
    const startTime = Date.now()

    // Slett alle bålmeldinger
    const deletedCount = await deleteAllBonfiresFromAzure()

    const duration = Date.now() - startTime
    const result = {
      success: true,
      message: `Nattlig opprydding fullført`,
      deletedCount,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Opprydding ferdig:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Feil ved nattlig opprydding:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Feil ved opprydding',
        details: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
}
