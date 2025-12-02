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

// Request-scoped cache for validerte adresser
// Bruker Map med timestamp som key for å unngå race conditions mellom brukere
const validatedAddressCache = new Map<string, {
  formattedAddress: string
  municipality: string
  latitude: number
  longitude: number
  timestamp: number
}>()

// Rydd opp gamle cache-entries (eldre enn 10 minutter)
function cleanupCache() {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000
  const keysToDelete: string[] = []
  validatedAddressCache.forEach((value, key) => {
    if (value.timestamp < tenMinutesAgo) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => validatedAddressCache.delete(key))
}

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
// Alle kommunenavn i lowercase for enklere matching
const GODKJENTE_KOMMUNER = [
  // Rogaland (23 kommuner)
  'stavanger', 'sandnes', 'sola', 'randaberg', 'strand', 'gjesdal',
  'klepp', 'time', 'hå', 'eigersund', 'sokndal', 'lund', 'bjerkreim',
  'hjelmeland', 'suldal', 'sauda', 'kvitsøy', 'bokn', 'tysvær',
  'karmøy', 'haugesund', 'vindafjord', 'utsira',
  // Vestland - Sunnhordland (5 kommuner som tilhører 110 Sør-Vest)
  'bømlo', 'stord', 'fitjar', 'sveio', 'etne',
  // Agder (1 kommune)
  'sirdal',
  // Alternative stavemåter og tettsteder som Google Maps kan returnere
  'rennesøy', 'finnøy', 'forsand', // Sammenslått med Stavanger/Sandnes/Strand
  'ølen', // Tettsted i Vindafjord
  'skudeneshavn', 'åkrehamn', 'kopervik', // Tettsteder i Karmøy
  'jørpeland', // Tettsted i Strand
  'tau', // Tettsted i Strand
  'bryne', // Tettsted i Time
  'nærbø', 'varhaug', // Tettsteder i Hå
  'ålgård', // Tettsted i Gjesdal
  'kleppe', // Tettsted i Klepp
  'tananger', // Tettsted i Sola
  'hommersåk', // Tettsted i Sandnes
  'leirvik', // Tettsted i Stord
  'sagvåg', // Tettsted i Stord
  'bremnes', // Tettsted i Bømlo
  'rubbestadneset', // Tettsted i Bømlo
  'skånevik', // Tettsted i Etne
  'aksdal', // Tettsted i Tysvær
  'nedstrand', // Tettsted i Tysvær
  'vikedal', // Tettsted i Vindafjord
  'sand', // Tettsted i Suldal
  'jelsa', // Tettsted i Suldal
  'egersund', // Alternativ skrivemåte
]

// Funksjon for å sjekke om kommune er godkjent (case-insensitive)
function isKommuneGodkjent(kommune: string): boolean {
  const normalized = kommune.toLowerCase().trim()
    .replace(' kommune', '') // Fjern "kommune" suffiks
    .replace(' municipality', '') // Fjern engelsk suffiks
  return GODKJENTE_KOMMUNER.includes(normalized)
}

const SYSTEM_PROMPT = `Du er en vennlig assistent for 110 Sør-Vest sin bålmeldingstjeneste.

Dagens dato og tid: ${getCurrentNorwayTime()} (norsk tid)

## DIN OPPGAVE
Samle inn ALLE obligatoriske felter for bålmelding. Brukeren kan oppgi informasjon i hvilken som helst rekkefølge. Du må holde oversikt over hvilke felt som mangler og spørre om dem.

## OBLIGATORISKE FELT (alle må fylles ut):
- Navn
- Adresse (valider med validateAddress)
- Telefonnummer (valider med validatePhoneNumber)
- E-post
- Bålstørrelse (Liten/Middels/Stor)
- Type bål (St. Hans/Hageavfall/Bygningsavfall/Annet)
- Dato og tidspunkt: FRA når og TIL når

## VALGFRITT FELT:
- Ekstra informasjon/beskrivelse

## VIKTIGE REGLER
1. Uansett hva brukeren sier først, sjekk hvilke obligatoriske felt som mangler
2. Hvis brukeren oppgir flere ting på en gang, registrer alt og spør om det som mangler
3. ALDRI lagre meldingen før ALLE 7 obligatoriske felt er fylt ut
4. Før lagring: Vis oppsummering av ALLE felt og be om bekreftelse
5. Etter vellykket lagring: Si kun "Bålmeldingen er sendt inn. Ha en trygg og sikker brenning!"

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
      console.log('🔍 Søker etter adresse:', address)

      let formattedAddress: string
      let location: { lat: number; lng: number }
      let placeName: string | undefined

      // Sjekk om input ser ut som en gateadresse (har nummer)
      const looksLikeStreetAddress = /\d/.test(address)

      if (looksLikeStreetAddress) {
        // For gateadresser, bruk Geocoding API først
        const geocodeResult = await mapsClient.geocode({
          params: {
            address: address + ', Norge',
            region: 'NO',
            components: { country: 'NO' },
            key: apiKey
          }
        })

        if (geocodeResult.data.results.length > 0) {
          const geoResult = geocodeResult.data.results[0]
          formattedAddress = geoResult.formatted_address
          location = geoResult.geometry.location
          console.log('📍 Geocoding fant:', formattedAddress, location)
        } else {
          return {
            success: false,
            message: 'Kunne ikke finne adressen. Sjekk stavemåten og prøv igjen.',
          }
        }
      } else {
        // For steder/butikker/landemerker, bruk Places API først
        const placesResult = await mapsClient.findPlaceFromText({
          params: {
            input: address + ' Rogaland Norge',
            inputtype: PlaceInputType.textQuery,
            fields: ['formatted_address', 'geometry', 'name', 'place_id'],
            locationbias: 'circle:50000@58.9,5.7', // Sentrert på Rogaland
            key: apiKey
          }
        })

        if (placesResult.data.candidates && placesResult.data.candidates.length > 0) {
          const place = placesResult.data.candidates[0]
          formattedAddress = place.formatted_address || address
          location = place.geometry?.location || { lat: 0, lng: 0 }
          placeName = place.name
          console.log('📍 Places API fant:', placeName, formattedAddress, location)
        } else {
          // Fallback til Geocoding hvis Places ikke finner noe
          const geocodeResult = await mapsClient.geocode({
            params: {
              address: address + ', Norge',
              region: 'NO',
              components: { country: 'NO' },
              key: apiKey
            }
          })

          if (geocodeResult.data.results.length > 0) {
            const geoResult = geocodeResult.data.results[0]
            formattedAddress = geoResult.formatted_address
            location = geoResult.geometry.location
            console.log('📍 Geocoding fallback fant:', formattedAddress, location)
          } else {
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
        }
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

      // Sjekk om stedet er innenfor dekningsområdet
      // Godkjent hvis: riktig fylke OG (kommune er godkjent ELLER vi er i Rogaland)
      const isInCorrectCounty = fylke === 'Rogaland' || fylke === 'Vestland' || fylke === 'Agder'
      const isKommuneValid = kommune && isKommuneGodkjent(kommune)

      // Spesialhåndtering: Hvis vi er i Rogaland, godkjenn alle steder
      // (dekker tilfeller der Google ikke returnerer riktig kommune)
      const isValidLocation = isInCorrectCounty && (isKommuneValid || fylke === 'Rogaland')

      console.log('🔍 Validering:', { fylke, kommune, isInCorrectCounty, isKommuneValid, isValidLocation })

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

      // KRITISK: Lagre validerte koordinater i cache
      // Bruk normalisert adresse som nøkkel for å finne igjen ved lagring
      const cacheKey = finalAddress.toLowerCase().trim()
      validatedAddressCache.set(cacheKey, {
        formattedAddress: finalAddress,
        municipality: kommune!, // Vi vet at kommune er satt her pga isValidLocation sjekken
        latitude: location.lat,
        longitude: location.lng,
        timestamp: Date.now()
      })
      // Lagre også med kommune som alternativ nøkkel
      validatedAddressCache.set(`latest_${kommune!.toLowerCase()}`, {
        formattedAddress: finalAddress,
        municipality: kommune!,
        latitude: location.lat,
        longitude: location.lng,
        timestamp: Date.now()
      })
      // Og en "siste validerte" nøkkel som fallback
      validatedAddressCache.set('__latest__', {
        formattedAddress: finalAddress,
        municipality: kommune!,
        latitude: location.lat,
        longitude: location.lng,
        timestamp: Date.now()
      })
      console.log('💾 Koordinater lagret i cache:', { cacheKey, lat: location.lat, lng: location.lng })
      cleanupCache() // Rydd opp gamle entries

      return {
        success: true,
        isWithinArea: true,
        formattedAddress: finalAddress,
        municipality: kommune,
        latitude: location.lat,
        longitude: location.lng,
        message: `Stedet er bekreftet: ${finalAddress} i ${kommune} kommune.`
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
  description: 'Lagrer bålmeldingen til Azure. KRITISK: Du MÅ bruke EKSAKTE verdier fra validateAddress for adresse, kommune, latitude og longitude. Disse koordinatene bestemmer hvor flammen vises på kartet! ALLE felt unntatt beskrivelse er OBLIGATORISKE.',
  inputSchema: z.object({
    navn: z.string().min(2).describe('Fullt navn på melder (OBLIGATORISK)'),
    telefon: z.string().describe('Telefonnummer (8 siffer, validert) (OBLIGATORISK)'),
    epost: z.string().email().describe('E-postadresse (OBLIGATORISK)'),
    adresse: z.string().describe('EKSAKT formattedAddress fra validateAddress - ALDRI brukerens tekst (OBLIGATORISK)'),
    kommune: z.string().describe('EKSAKT municipality fra validateAddress (OBLIGATORISK)'),
    latitude: z.number().describe('EKSAKT latitude fra validateAddress (f.eks. 58.969976) (OBLIGATORISK)'),
    longitude: z.number().describe('EKSAKT longitude fra validateAddress (f.eks. 5.733107) (OBLIGATORISK)'),
    balstorrelse: z.enum(['Liten', 'Middels', 'Stor']).describe('Størrelse på bålet (OBLIGATORISK)'),
    type: z.enum(['St. Hans', 'Hageavfall', 'Bygningsavfall', 'Annet']).describe('Type bål (OBLIGATORISK)'),
    fra: z.string().describe('Fra tidspunkt (ISO 8601) (OBLIGATORISK)'),
    til: z.string().describe('Til tidspunkt (ISO 8601) (OBLIGATORISK)'),
    beskrivelse: z.string().optional().describe('Ekstra informasjon/beskrivelse (valgfritt)'),
  }),
  execute: async (data) => {
    try {
      // KRITISK FIX: Finn validerte koordinater fra cache
      // Prøv flere nøkler for å finne riktig adresse
      const addressKey = data.adresse.toLowerCase().trim()
      const municipalityKey = `latest_${data.kommune.toLowerCase()}`

      let cachedAddress = validatedAddressCache.get(addressKey)
                        || validatedAddressCache.get(municipalityKey)
                        || validatedAddressCache.get('__latest__')

      // Log for debugging
      console.log('🎯 AI sender følgende data:', {
        adresse: data.adresse,
        kommune: data.kommune,
        latitude: data.latitude,
        longitude: data.longitude,
      })

      if (cachedAddress) {
        console.log('✅ Fant LAGREDE koordinater i cache:', {
          adresse: cachedAddress.formattedAddress,
          kommune: cachedAddress.municipality,
          latitude: cachedAddress.latitude,
          longitude: cachedAddress.longitude,
        })
      } else {
        console.warn('⚠️ Ingen cache funnet - bruker AI-ens koordinater (kan være unøyaktige)')
        // Fallback til AI-ens data hvis ingen cache (bør ikke skje normalt)
        cachedAddress = {
          formattedAddress: data.adresse,
          municipality: data.kommune,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: Date.now()
        }
      }

      // Bruk de lagrede koordinatene (fra validateAddress)
      const lat = cachedAddress.latitude
      const lng = cachedAddress.longitude
      const finalAddress = cachedAddress.formattedAddress
      const finalMunicipality = cachedAddress.municipality

      // Valider at koordinatene er realistiske for Norge (lat: 58-71, lng: 4-31)
      if (isNaN(lat) || isNaN(lng) || lat < 57 || lat > 72 || lng < 4 || lng > 32) {
        console.error('❌ Ugyldige koordinater:', { lat, lng })
        return {
          success: false,
          message: 'Kunne ikke lagre - ugyldige koordinater. Prøv å validere adressen på nytt.',
        }
      }

      const azureId = await createBonfireInAzure({
        navn: data.navn,
        telefon: data.telefon,
        epost: data.epost,
        adresse: finalAddress,
        kommune: finalMunicipality,
        latitude: lat,
        longitude: lng,
        balstorrelse: data.balstorrelse,
        type: data.type,
        fra: data.fra,
        til: data.til,
        beskrivelse: data.beskrivelse || 'Registrert via AI-chat',
      })

      console.log('✅ Bålmelding lagret i Azure Tables! RowKey:', azureId)

      return {
        success: true,
        message: 'Bålmeldingen er sendt inn. Ha en trygg og sikker brenning!',
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
