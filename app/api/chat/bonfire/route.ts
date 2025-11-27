import { createAzure } from '@ai-sdk/azure'
import { streamText } from 'ai'
import { z } from 'zod'
import { Client } from '@googlemaps/google-maps-services-js'
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

// Godkjente kommuner for 110 Sør-Vest
const GODKJENTE_KOMMUNER = [
  // Rogaland (22 kommuner)
  'Stavanger', 'Sandnes', 'Sola', 'Randaberg', 'Strand', 'Gjesdal',
  'Klepp', 'Time', 'Hå', 'Eigersund', 'Sokndal', 'Lund', 'Bjerkreim',
  'Hjelmeland', 'Suldal', 'Sauda', 'Kvitsøy', 'Bokn', 'Tysvær',
  'Karmøy', 'Haugesund', 'Vindafjord',
  // Vestland (6 kommuner)
  'Bømlo', 'Stord', 'Fitjar', 'Sveio', 'Etne',
  // Agder (1 kommune)
  'Sirdal'
]

// Tool schemas - AI SDK v5 uses inputSchema instead of parameters
const validateAddressSchema = z.object({
  address: z.string().describe('Adressen som skal valideres (f.eks. "Kirkegata 12, Stavanger")'),
})

const validatePhoneSchema = z.object({
  phoneNumber: z.string().describe('Telefonnummeret som skal valideres'),
})

const saveBonfireSchema = z.object({
  navn: z.string().min(2).describe('Fullt navn'),
  telefon: z.string().describe('Telefonnummer (8 siffer)'),
  epost: z.string().email().describe('E-postadresse'),
  adresse: z.string().describe('Verifisert adresse fra validateAddress'),
  kommune: z.string().describe('Kommune fra validateAddress'),
  latitude: z.number().describe('Breddegrad fra validateAddress'),
  longitude: z.number().describe('Lengdegrad fra validateAddress'),
  balstorrelse: z.enum(['Liten', 'Middels', 'Stor']).describe('Størrelse på bålet'),
  type: z.enum(['St. Hans', 'Hageavfall', 'Bygningsavfall', 'Annet']).describe('Type bål'),
  fra: z.string().optional().describe('Fra tidspunkt (ISO 8601)'),
  til: z.string().optional().describe('Til tidspunkt (ISO 8601)'),
  beskrivelse: z.string().optional().describe('Beskrivelse av brenningen'),
})

const SYSTEM_PROMPT = `Du er en hjelpsom AI-assistent for 110 Sør-Vest sitt bålmeldingssystem.

## VIKTIG TIDSINFORMASJON
Dagens dato og tid er: ${getCurrentNorwayTime()} (norsk tid)

## Din oppgave
Hjelp brukeren med å registrere en bålmelding ved å samle inn nødvendig informasjon gjennom en naturlig samtale.

## Informasjon du trenger (PÅKREVD)
- Navn
- Telefonnummer (8 siffer)
- E-postadresse
- Adresse (må valideres med validateAddress)
- Kommune (må være i vårt dekningsområde)
- Bålstørrelse (Liten/Middels/Stor)
- Type bål (St. Hans/Hageavfall/Bygningsavfall/Annet)

## Valgfritt
- Fra og til tidspunkt
- Beskrivelse

## Godkjente kommuner (29 stk)
Rogaland: Stavanger, Sandnes, Sola, Randaberg, Strand, Gjesdal, Klepp, Time, Hå, Eigersund, Sokndal, Lund, Bjerkreim, Hjelmeland, Suldal, Sauda, Kvitsøy, Bokn, Tysvær, Karmøy, Haugesund, Vindafjord
Vestland: Bømlo, Stord, Fitjar, Sveio, Etne
Agder: Sirdal

## Viktige regler
- Vær vennlig og naturlig i tonen
- Ikke still alle spørsmål på en gang
- Valider ALLTID adresse med validateAddress før du fortsetter
- Når du har ALL info, vis oppsummering og be om bekreftelse
- Når bruker bekrefter, bruk saveBonfireNotification for å lagre
- ALDRI bruk markdown-formattering i svarene

## Eksempel samtale
Bruker: "Hei, jeg vil melde fra om bålbrenning"
Du: "Hei! Jeg hjelper deg gjerne med å registrere en bålmelding. Hva heter du, og hvor skal bålet være?"
`

export async function POST(req: Request) {
  const { messages } = await req.json()

  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o'
  const model = azure(deploymentName)

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages,

    tools: {
      // Tool 1: Validate address with Google Maps
      validateAddress: {
        description: 'Validerer norsk adresse og henter koordinater via Google Maps. Bruk denne når bruker oppgir adresse.',
        inputSchema: validateAddressSchema,
        execute: async ({ address }: z.infer<typeof validateAddressSchema>) => {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

          if (!apiKey) {
            return {
              success: false,
              message: 'Google Maps API-nøkkel mangler. Kontakt systemadministrator.',
            }
          }

          try {
            // Try autocomplete first for better suggestions
            const autocompleteResult = await mapsClient.placeAutocomplete({
              params: {
                input: address,
                components: ['country:no'],
                key: apiKey
              }
            })

            // Then geocode
            const geocodeResult = await mapsClient.geocode({
              params: {
                address: address,
                region: 'NO',
                components: { country: 'NO' },
                key: apiKey
              }
            })

            if (geocodeResult.data.results.length === 0) {
              if (autocompleteResult.data.predictions.length > 0) {
                const suggestions = autocompleteResult.data.predictions
                  .slice(0, 5)
                  .map(p => p.description)
                return {
                  success: false,
                  suggestions,
                  message: 'Fant ikke eksakt adresse. Her er forslag:'
                }
              }
              return {
                success: false,
                message: 'Kunne ikke finne adressen. Sjekk stavemåten.',
              }
            }

            const geoResult = geocodeResult.data.results[0]
            const formattedAddress = geoResult.formatted_address
            const location = geoResult.geometry.location

            // Extract municipality and county
            let kommune: string | null = null
            let fylke: string | null = null
            for (const component of geoResult.address_components) {
              const types = component.types as string[]
              if (types.includes('administrative_area_level_2')) {
                kommune = component.long_name
              }
              if (!kommune && (types.includes('postal_town') || types.includes('locality'))) {
                kommune = component.long_name
              }
              if (types.includes('administrative_area_level_1')) {
                fylke = component.long_name
              }
            }

            // Check if in valid area
            const isValidLocation = (fylke === 'Rogaland' || fylke === 'Vestland' || fylke === 'Agder') &&
                                    kommune && GODKJENTE_KOMMUNER.includes(kommune)

            if (!isValidLocation) {
              return {
                success: false,
                message: `Adressen ligger i ${kommune || 'ukjent kommune'}, ${fylke || 'ukjent fylke'} som ikke dekkes av 110 Sør-Vest.`,
                outsideArea: true
              }
            }

            return {
              success: true,
              formattedAddress,
              municipality: kommune,
              latitude: location.lat,
              longitude: location.lng,
            }
          } catch (error) {
            console.error('Geocoding error:', error)
            return {
              success: false,
              message: 'Teknisk feil ved adressevalidering. Prøv igjen.',
            }
          }
        },
      },

      // Tool 2: Validate phone number
      validatePhoneNumber: {
        description: 'Validerer et norsk telefonnummer (8 siffer)',
        inputSchema: validatePhoneSchema,
        execute: async ({ phoneNumber }: z.infer<typeof validatePhoneSchema>) => {
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
      },

      // Tool 3: Save bonfire notification
      saveBonfireNotification: {
        description: 'Lagrer bålmeldingen til Azure. Bruk ETTER at brukeren har bekreftet all informasjon.',
        inputSchema: saveBonfireSchema,
        execute: async (data: z.infer<typeof saveBonfireSchema>) => {
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
      },
    },
  })

  return result.toTextStreamResponse()
}
