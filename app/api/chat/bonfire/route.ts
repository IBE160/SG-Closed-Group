/**
 * Bonfire Chat API Route
 *
 * Epic 5 Vol.2: AI-drevet bålmeldingssystem med Google Places API
 *
 * Funksjoner:
 * - AI-chat for innsamling av bålmeldingsdata
 * - Google Places API for landemerke-gjenkjenning (domkirke, kjøpesenter, etc.)
 * - Reverse geocoding for nøyaktig kommune-identifikasjon
 * - Azure Table Storage for lagring av bålmeldinger
 *
 * @see docs/sprint-artifacts/epic-5-vol-2/tech-spec.md
 */

import { createAzure } from '@ai-sdk/azure'
import { generateText, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js'
import { createBonfireInAzure } from '@/lib/azure-table'

// Initialize Azure OpenAI client
const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_ENDPOINT?.split('//')[1]?.split('.')[0] || '',
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
})

const mapsClient = new Client({})

function getCurrentNorwayTime() {
  const now = new Date()
  return new Intl.DateTimeFormat('no-NO', {
    timeZone: 'Europe/Oslo',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now)
}

// Godkjente kommuner for 110 Sør-Vest (29 kommuner totalt)
// Kilde: https://www.rogbr.no/110-sor-vest/kommuner
const GODKJENTE_KOMMUNER = [
  // Rogaland (23 kommuner)
  'Stavanger', 'Sandnes', 'Sola', 'Randaberg', 'Strand', 'Gjesdal',
  'Klepp', 'Time', 'Hå', 'Eigersund', 'Sokndal', 'Lund', 'Bjerkreim',
  'Hjelmeland', 'Suldal', 'Sauda', 'Kvitsøy', 'Bokn', 'Tysvær',
  'Karmøy', 'Haugesund', 'Vindafjord', 'Utsira',
  // Vestland - Sunnhordland (5 kommuner som tilhører 110 Sør-Vest)
  'Bømlo', 'Stord', 'Fitjar', 'Sveio', 'Etne',
  // Agder (1 kommune)
  'Sirdal'
]

const SYSTEM_PROMPT = `Du er en vennlig assistent for 110 Sør-Vest sin bålmeldingstjeneste.

Dagens dato og tid: ${getCurrentNorwayTime()} (norsk tid)

## DIN OPPGAVE
Samle inn informasjon for bålmelding. Still ETT spørsmål om gangen:
1. Navn
2. Adresse → KALL validateAddress UMIDDELBART!
3. Telefonnummer → KALL validatePhoneNumber
4. E-post
5. Bålstørrelse (Liten/Middels/Stor)
6. Type (St. Hans/Hageavfall/Bygningsavfall/Annet)
7. Tidspunkt (valgfritt)

## KRITISK: SLIK HÅNDTERER DU ADRESSER

Når bruker oppgir et sted, KALL validateAddress MED EN GANG!

Verktøyet svarer med:
- success=true, isWithinArea=true → Stedet er GODKJENT! Fortell brukeren den verifiserte adressen og gå videre til telefonnummer.
- success=false, isWithinArea=false → Stedet er UTENFOR vårt område. Forklar vennlig at de må kontakte sin lokale brannstasjon.
- success=false (uten isWithinArea) → Teknisk feil eller fant ikke stedet. Be om mer spesifikk adresse.

IKKE overstyr verktøyet! Hvis det sier success=true, er adressen godkjent.

## VÅRT DEKNINGSOMRÅDE (29 kommuner)
Rogaland: Stavanger, Sandnes, Sola, Randaberg, Strand, Gjesdal, Klepp, Time, Hå, Eigersund, Sokndal, Lund, Bjerkreim, Hjelmeland, Suldal, Sauda, Kvitsøy, Bokn, Tysvær, Karmøy, Haugesund, Vindafjord, Utsira
Vestland: Bømlo, Stord, Fitjar, Sveio, Etne
Agder: Sirdal

## VED LAGRING (saveBonfireNotification)
Bruk EKSAKT disse verdiene fra validateAddress:
- adresse: formattedAddress
- kommune: municipality
- latitude: latitude (tall, f.eks. 58.969976)
- longitude: longitude (tall, f.eks. 5.733107)

## REGLER
- Korte, tydelige svar på norsk
- ALDRI bruk markdown, stjerner eller formattering
- Når alle data er samlet, gi oppsummering og be om bekreftelse
- Etter bekreftelse, lagre med saveBonfireNotification
`

// Tool definitions using AI SDK v5 tool() helper
const validateAddressTool = tool({
  description: 'PÅKREVD: Kall dette verktøyet HVER gang bruker nevner et sted, adresse eller landemerke. Returnerer nøyaktige koordinater (latitude/longitude) som plasserer bålet korrekt på kartet. Du MÅ bruke returnerte verdier ved lagring.',
  inputSchema: z.object({
    address: z.string().describe('Stedet brukeren oppga - adresse, stedsnavn, landemerke, etc. (f.eks. "Kirkegata 12 Stavanger", "domkirken stavanger", "Hinna Park")'),
  }),
  execute: async ({ address }) => {
    // Use server-side API key (no referrer restrictions) or fall back to public key
    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return {
        success: false,
        message: 'Google Maps API-nøkkel mangler. Kontakt systemadministrator.',
      }
    }

    try {
      // Først prøv Places API for bedre stedsgjenkjenning (landemerker, etc.)
      const placesResult = await mapsClient.findPlaceFromText({
        params: {
          input: address + ' Norge',
          inputtype: PlaceInputType.textQuery,
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
          locationbias: 'circle:50000@58.97,5.73', // Bias mot Stavanger-området
          key: apiKey
        }
      })

      let formattedAddress: string
      let location: { lat: number; lng: number }
      let placeName: string | undefined

      // Hvis Places API finner noe, bruk det
      if (placesResult.data.candidates && placesResult.data.candidates.length > 0) {
        const place = placesResult.data.candidates[0]
        formattedAddress = place.formatted_address || address
        location = place.geometry?.location || { lat: 0, lng: 0 }
        placeName = place.name

        console.log('📍 Places API fant:', placeName, formattedAddress, location)
      } else {
        // Fallback til Geocoding API
        const geocodeResult = await mapsClient.geocode({
          params: {
            address: address,
            region: 'NO',
            components: { country: 'NO' },
            key: apiKey
          }
        })

        if (geocodeResult.data.results.length === 0) {
          // Prøv autocomplete for forslag
          const autocompleteResult = await mapsClient.placeAutocomplete({
            params: {
              input: address,
              components: ['country:no'],
              key: apiKey
            }
          })

          if (autocompleteResult.data.predictions.length > 0) {
            const suggestions = autocompleteResult.data.predictions
              .slice(0, 5)
              .map(p => p.description)
            return {
              success: false,
              suggestions,
              message: 'Fant ikke eksakt sted. Her er forslag:'
            }
          }
          return {
            success: false,
            message: 'Kunne ikke finne stedet. Prøv med en mer spesifikk adresse.',
          }
        }

        const geoResult = geocodeResult.data.results[0]
        formattedAddress = geoResult.formatted_address
        location = geoResult.geometry.location
      }

      // Hent kommune og fylke via reverse geocoding for å være sikker
      const reverseResult = await mapsClient.reverseGeocode({
        params: {
          latlng: location,
          key: apiKey
        }
      })

      let kommune: string | null = null
      let fylke: string | null = null

      if (reverseResult.data.results.length > 0) {
        for (const result of reverseResult.data.results) {
          for (const component of result.address_components) {
            const types = component.types as string[]
            if (types.includes('administrative_area_level_2') && !kommune) {
              kommune = component.long_name
            }
            if (!kommune && (types.includes('postal_town') || types.includes('locality'))) {
              kommune = component.long_name
            }
            if (types.includes('administrative_area_level_1') && !fylke) {
              fylke = component.long_name
            }
          }
          if (kommune && fylke) break
        }
      }

      const isValidLocation = (fylke === 'Rogaland' || fylke === 'Vestland' || fylke === 'Agder') &&
                              kommune && GODKJENTE_KOMMUNER.includes(kommune)

      if (!isValidLocation) {
        return {
          success: false,
          isWithinArea: false,
          message: `Beklager, ${kommune || 'dette stedet'} i ${fylke || 'ukjent fylke'} dekkes IKKE av 110 Sør-Vest. Brukeren må kontakte sin lokale brannstasjon.`,
          detectedMunicipality: kommune,
          detectedCounty: fylke
        }
      }

      // Inkluder stedsnavn i adressen hvis det er et landemerke
      const finalAddress = placeName && !formattedAddress.toLowerCase().includes(placeName.toLowerCase())
        ? `${placeName}, ${formattedAddress}`
        : formattedAddress

      console.log('✅ Sted validert:', finalAddress, kommune, location.lat, location.lng)

      return {
        success: true,
        isWithinArea: true,
        formattedAddress: finalAddress,
        municipality: kommune,
        latitude: location.lat,
        longitude: location.lng,
        message: `Stedet er bekreftet: ${finalAddress} i ${kommune} kommune. Koordinater: ${location.lat}, ${location.lng}`
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return {
        success: false,
        message: 'Teknisk feil ved adressevalidering. Prøv igjen.',
      }
    }
  },
})

const validatePhoneNumberTool = tool({
  description: 'Validerer et norsk telefonnummer (8 siffer)',
  inputSchema: z.object({
    phoneNumber: z.string().describe('Telefonnummeret som skal valideres'),
  }),
  execute: async ({ phoneNumber }) => {
    const cleaned = phoneNumber
      .replace(/\s/g, '')
      .replace(/-/g, '')
      .replace(/^\+47/, '')
      .replace(/^0047/, '')

    const isValid = /^[49]\d{7}$/.test(cleaned)

    return {
      isValid,
      cleaned,
      formatted: isValid ? `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}` : null,
      message: isValid
        ? `Gyldig nummer: ${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`
        : 'Ugyldig nummer. Norske mobilnummer er 8 siffer og starter med 4 eller 9.',
    }
  },
})

const saveBonfireNotificationTool = tool({
  description: 'Lagrer bålmeldingen til Azure. KRITISK: Du MÅ bruke EKSAKTE verdier fra validateAddress for adresse, kommune, latitude og longitude. Disse koordinatene bestemmer hvor flammen vises på kartet!',
  inputSchema: z.object({
    navn: z.string().min(2).describe('Fullt navn på melder'),
    telefon: z.string().describe('Telefonnummer (8 siffer, validert)'),
    epost: z.string().email().describe('E-postadresse'),
    adresse: z.string().describe('EKSAKT formattedAddress fra validateAddress - ALDRI brukerens tekst'),
    kommune: z.string().describe('EKSAKT municipality fra validateAddress'),
    latitude: z.number().describe('EKSAKT latitude fra validateAddress (f.eks. 58.969976)'),
    longitude: z.number().describe('EKSAKT longitude fra validateAddress (f.eks. 5.733107)'),
    balstorrelse: z.enum(['Liten', 'Middels', 'Stor']).describe('Størrelse på bålet'),
    type: z.enum(['St. Hans', 'Hageavfall', 'Bygningsavfall', 'Annet']).describe('Type bål'),
    fra: z.string().optional().describe('Fra tidspunkt (ISO 8601)'),
    til: z.string().optional().describe('Til tidspunkt (ISO 8601)'),
    beskrivelse: z.string().optional().describe('Beskrivelse av brenningen'),
  }),
  execute: async (data) => {
    try {
      const azureId = await createBonfireInAzure({
        navn: data.navn,
        telefon: data.telefon,
        epost: data.epost,
        adresse: data.adresse,
        kommune: data.kommune,
        latitude: data.latitude,
        longitude: data.longitude,
        balstorrelse: data.balstorrelse,
        type: data.type,
        fra: data.fra ?? undefined,
        til: data.til ?? undefined,
        beskrivelse: data.beskrivelse || 'Registrert via AI-chat',
      })

      console.log('✅ Bålmelding lagret i Azure Tables! RowKey:', azureId)

      return {
        success: true,
        id: azureId,
        message: `Bålmeldingen er registrert! Referansenummer: ${azureId.slice(0, 8).toUpperCase()}`,
      }
    } catch (error) {
      console.error('Error saving bonfire:', error)
      return {
        success: false,
        message: 'Kunne ikke lagre bålmeldingen. Kontakt 110 Sør-Vest direkte.',
      }
    }
  },
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o'
    const model = azure(deploymentName)

    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      tools: {
        validateAddress: validateAddressTool,
        validatePhoneNumber: validatePhoneNumberTool,
        saveBonfireNotification: saveBonfireNotificationTool,
      },
      stopWhen: stepCountIs(5),
    })

    return new Response(result.text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Beklager, det oppstod en feil. Prøv igjen.', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
}
