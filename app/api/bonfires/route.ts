import { NextRequest, NextResponse } from 'next/server'
import { getAllBonfiresFromAzure, createBonfireInAzure } from '@/lib/azure-table'
import { z } from 'zod'

const createBonfireSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^[0-9]{8}$/),
  email: z.string().email(),
  address: z.string().min(5),
  municipality: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  bonfireType: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'VERY_LARGE']),
  bonfireCategory: z.enum(['SAINT_HANS', 'GARDEN_WASTE', 'CONSTRUCTION_WASTE', 'OTHER']),
  dateFrom: z.string(),
  dateTo: z.string(),
  description: z.string().optional()
})

export async function GET() {
  try {
    const bonfires = await getAllBonfiresFromAzure()

    // Map Azure entities to expected format
    const mapped = bonfires.map(b => ({
      id: b.rowKey,
      name: b.navn,
      phone: b.telefon,
      email: b.epost,
      address: b.adresse,
      municipality: b.kommune,
      latitude: b.latitude,
      longitude: b.longitude,
      bonfireType: b.balstorrelse,
      bonfireCategory: b.type,
      dateFrom: b.fra,
      dateTo: b.til,
      description: b.beskrivelse,
      status: b.status,
      createdAt: b.timestamp
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Feil:', error)
    return NextResponse.json({ error: 'Feil' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBonfireSchema.parse(body)

    // Map bonfireType til riktig format for Azure
    let balstorrelseText = 'Liten'
    if (validatedData.bonfireType === 'MEDIUM') {
      balstorrelseText = 'Middels'
    } else if (validatedData.bonfireType === 'LARGE' || validatedData.bonfireType === 'VERY_LARGE') {
      balstorrelseText = 'Stor'
    }

    // Map bonfireCategory til riktig format
    let typeText = 'Annet'
    if (validatedData.bonfireCategory === 'SAINT_HANS') {
      typeText = 'St. Hans'
    } else if (validatedData.bonfireCategory === 'GARDEN_WASTE') {
      typeText = 'Hageavfall'
    } else if (validatedData.bonfireCategory === 'CONSTRUCTION_WASTE') {
      typeText = 'Bygningsavfall'
    }

    console.log('📍 Lagrer skjema til Azure med koordinater:', {
      lat: validatedData.latitude,
      lng: validatedData.longitude,
      adresse: validatedData.address
    })

    const azureId = await createBonfireInAzure({
      navn: validatedData.name,
      telefon: validatedData.phone,
      epost: validatedData.email,
      adresse: validatedData.address,
      kommune: validatedData.municipality,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      balstorrelse: balstorrelseText,
      type: typeText,
      fra: validatedData.dateFrom,
      til: validatedData.dateTo,
      beskrivelse: validatedData.description || 'Registrert via skjema',
    })

    console.log('✅ Bålmelding fra skjema lagret i Azure Tables! RowKey:', azureId)

    return NextResponse.json({
      id: azureId,
      success: true
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ugyldig data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Feil:', error)
    return NextResponse.json({ error: 'Feil' }, { status: 500 })
  }
}
