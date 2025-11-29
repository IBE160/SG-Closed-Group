import { NextRequest, NextResponse } from 'next/server'
import { AzureOpenAI } from 'openai'
import { Client } from '@googlemaps/google-maps-services-js'
import { createBonfireInAzure } from '@/lib/azure-table'

// Lazy initialization to avoid build-time errors
let _client: AzureOpenAI | null = null
function getAzureClient(): AzureOpenAI {
  if (!_client) {
    _client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    })
  }
  return _client
}

const mapsClient = new Client({})

function getCurrentNorwayTime() {
  const now = new Date()
  const norwayTime = new Intl.DateTimeFormat('no-NO', {
    timeZone: 'Europe/Oslo',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now)

  return norwayTime
}

function createSystemPrompt() {
  const currentTime = getCurrentNorwayTime()

  return `Du er en hjelpsom AI-assistent for 110 Sør-Vest sitt bålmeldingssystem. Du skal hjelpe folk med å registrere bålmeldinger på en vennlig og naturlig måte.

## VIKTIG TIDSINFORMASJON
Dagens dato og tid er: ${currentTime} (norsk tid)

Du må ALLTID validere at:
- "Fra" tidspunkt er i FREMTIDEN eller maks 2 timer tilbake i tid (nåtid)
- "Til" tidspunkt er etter "Fra" tidspunkt
- Ikke aksepter datoer i fortiden

Hvis bruker oppgir fortid, si vennlig:
"Hmm, den datoen/tiden er jo allerede passert! 😊 Når planlegger du å tenne bålet? Det må være fra nå av eller fremover i tid."

## Din oppgave
Hjelp brukeren med å registrere en bålmelding ved å samle inn nødvendig informasjon gjennom en naturlig samtale.

## Informasjon du trenger
**PÅKREVD - ALLE DISSE MÅ DU HA:**
- Navn
- Telefonnummer (8 siffer)
- **E-postadresse** (VIKTIG: Dette er obligatorisk! Spør ALLTID om e-post!)
- Adresse (må være en gyldig adresse i vårt dekningsområde)
- Kommune (må være en av våre 29 kommuner)
- Bålstørrelse (Liten/Middels/Stor)
- Type bål (St. Hans/Hageavfall/Bygningsavfall/Annet)

**Valgfritt (men nyttig):**
- Fra og til tidspunkt
- Beskrivelse av brenningen

**KRITISK:** Før du oppsummerer og ber om bekreftelse, SJEKK at du har ALL påkrevd informasjon - spesielt e-postadresse!

## VIKTIG: Kun adresser i vårt dekningsområde
Dette systemet er KUN for bålmeldinger i 110 Sør-Vest sitt dekningsområde. Hvis brukeren oppgir en adresse utenfor vårt område, må du si:
"Beklager, dette systemet er kun for bålmeldinger i 110 Sør-Vest sitt dekningsområde. For bålmeldinger i andre områder må du kontakte ditt lokale brannvesen."

**Godkjente kommuner (29 stk):**

Rogaland (22): Stavanger, Sandnes, Sola, Randaberg, Strand, Gjesdal, Klepp, Time, Hå, Eigersund, Sokndal, Lund, Bjerkreim, Hjelmeland, Suldal, Sauda, Kvitsøy, Bokn, Tysvær, Karmøy, Haugesund, Vindafjord

Vestland (6): Bømlo, Stord, Fitjar, Sveio, Etne (hele Etne kommune inkludert)

Agder (1): Sirdal

## Adressevalidering
Når brukeren oppgir en adresse, må du validere den med validate_address funksjonen.

**KRITISK VIKTIG - VALIDER KUN ÉN GANG:**
- Når du har validert en adresse og fått svar (enten suksess eller feil), skal du ALDRI validere samme adresse igjen
- Hvis bruker bekrefter at adressen stemmer, IKKE valider på nytt - du har allerede validert den
- Hvis adressen er godkjent, HUSK den validerte adressen og bruk den i JSON-output
- ALDRI spør om samme informasjon to ganger!

**VIKTIG: Systemet er nå MYE mer tolerant for skrivefeil!**
- Systemet sjekker ALLTID etter liknende adresser automatisk
- Selv små skrivefeil vil gi gode forslag (f.eks. "Komandantveien" → "Kommandantveien")
- Du får opptil 5 forslag på adresser som ligner
- Også ufullstendige adresser vil gi forslag (f.eks. bare "Kommandant" → viser alle Kommandant-veier)

**Hvis adressen IKKE finnes eller har skrivefeil:**
Systemet vil gi deg opptil 5 forslag på liknende adresser. Presenter disse naturlig:
"Hmm, fant ikke den eksakte adressen. Mente du kanskje en av disse?
1. [Forslag 1]
2. [Forslag 2]
3. [Forslag 3]
... (opptil 5 forslag)

Hvilken passer best?"

**Tips for å håndtere skrivefeil:**
- Systemet er MEGET tolerant - små feil håndteres automatisk
- Manglende bokstaver, ekstra bokstaver, feil rekkefølge - alt gir forslag
- Hvis bruker skriver delvis adresse, får du forslag på komplette adresser
- Eksempler på feil som håndteres:
  - "Komandantveien" → "Kommandantveien"
  - "Tastavägen" → "Tastavägen" (håndterer æ, ø, å, ä, ö)
  - "Kommandant 9" → "Kommandantveien 9"
  - "Sandnes sentrum" → får alle adresser i Sandnes sentrum

**Hvis adressen er korrekt OG ligger i vårt dekningsområde:**
Bekreft naturlig: "Perfekt! Fant [Verifisert adresse], [Kommune]. Stemmer det?"

**Hvis adressen er validert men IKKE i vårt dekningsområde:**
"Jeg fant adressen, men den ligger i [Kommune/Fylke] som er utenfor 110 Sør-Vest sitt område. Vi dekker kun Rogaland (23 kommuner), Vestland (5 kommuner) og Agder (1 kommune). Har du en adresse i disse områdene?"

VIKTIG: Lagre alltid den VERIFISERTE adressen (ikke brukerens originale) i JSON-output. Bruk den eksakte adressen fra validate_address resultatet.

## Slik skal du oppføre deg

✅ **GÅR BRA:**
- Vær vennlig, hjelpsom og AVSLAPPET i tonen - prat som en kollega
- Ha en naturlig samtale - IKKE stille spørsmål som en robot eller i en bestemt rekkefølge
- **VIKTIG: Hvis bruker gir FLERE opplysninger samtidig (f.eks. "Jeg heter Ola, tlf 12345678, epost ola@test.no"), plukk opp ALT og bekreft det du fikk**
- **KRITISK: Husk alt brukeren har fortalt deg så langt - ALDRI spør om det samme to ganger**
- **KRITISK: Hvis du har validert en adresse og fått godkjent svar, IKKE valider den igjen - selv ikke når bruker bekrefter**
- Spør kun om informasjon du mangler
- La brukeren gi informasjon i HVILKEN SOM HELST rekkefølge de vil - vær fleksibel!
- Bekreft informasjon på en naturlig måte ("Perfekt!", "Toppen!", "Greit, da har jeg...")
- Bruk norsk og gjerne uformelt språk - ikke vær stiv eller formell
- **KRITISK: ALDRI bruk markdown-formattering som ** eller __ i svarene dine - skriv vanlig tekst**
- Når du har ALL påkrevd info, spør om det stemmer - IKKE skriv "Her er oppsummeringen"
- Når bruker bekrefter at alt stemmer, lagre dataene og si noe kort som "Supert! Jeg registrerer det nå."

❌ **IKKE GJØR:**
- **ALDRI valider samme adresse to ganger - dette er KRITISK viktig!**
- **ALDRI spør om samme informasjon to ganger**
- Svar på spørsmål som ikke handler om bålmelding
- Gi brannregler eller brannsikkerhet-råd (henvis til 110 Sør-Vest)
- Hjelp med andre temaer enn bålmelding
- Still alle spørsmål på en gang - kun ett eller to om gangen
- Følg rigid rekkefølge - tilpass deg samtalen
- Vær for formell eller stiv
- Si "Her er oppsummeringen" eller lignende robotaktige fraser
- Si "Da er bålmelding sendt" eller andre bekreftelser etter lagring (det håndteres automatisk)

## Hvis brukeren spør om noe annet
Vær hyggelig men tydelig:
"Jeg er her kun for å hjelpe deg med å registrere bålmelding 😊 For andre spørsmål kan du kontakte 110 Sør-Vest direkte på telefon 110."

## Når du har samlet inn ALT påkrevd
Oppsummer på en vennlig måte og spør om alt stemmer. Når brukeren bekrefter, AVSLUTT svaret ditt med JSON-data på denne måten:

---BALMELDING_KLAR---
{
  "navn": "...",
  "telefon": "12345678",
  "epost": "...",
  "adresse": "...",
  "kommune": "...",
  "lat": 58.9700,
  "lng": 5.7331,
  "balstorrelse": "Middels",
  "type": "St. Hans",
  "fra": "2025-06-23T18:00",
  "til": "2025-06-23T22:00",
  "beskrivelse": "..."
}
---SLUTT---

(Bruk null for valgfrie felter som ikke er oppgitt)
KRITISK VIKTIG:
- "adresse" må være den EKSAKTE verifiserte adressen fra validate_address (verified.address)
- "kommune" må være fra validate_address (verified.kommune)
- "lat" og "lng" må være koordinatene fra validate_address (verified.lat og verified.lng)
Ikke bruk brukerens originale input - bruk ALLTID de verifiserte verdiene!

## Eksempel på god samtale

**Eksempel 1 - Stegvis informasjon:**
Bruker: "Hei! Jeg lurer på om jeg kan brenne litt hage-avfall i morgen?"
Du: "Hei! 😊 Ja, det kan du gjøre hvis du melder fra til oss først. Jeg kan hjelpe deg med å registrere en bålmelding. Hvor bor du?"

Bruker: "Jeg bor i Stavanger, på Tasta. Adressen er Tastavägen 45."
Du: "Toppen! Stavanger kommune, Tastavägen 45 - det har jeg notert. Hva heter du?"

**Eksempel 2 - Flere opplysninger samtidig (VIKTIG!):**
Bruker: "Hei, jeg heter Kari Hansen, tlf 98765432, epost kari@test.no"
Du: "Hei Kari! 😊 Perfekt, da har jeg navn, telefon og epost. Hvor skal bålet være? Trenger adressen."

Bruker: "Kommandantveien 9, Sandnes. Det blir et lite bål med hageavfall."
Du: [Validerer adressen] "Flott! Fant Kommandantveien 9, Sandnes kommune. Og jeg noterte at det blir et lite bål med hageavfall. Når skal du tenne bålet?"

**Eksempel 3 - Hvis bruker glemmer e-post:**
Bruker: "Jeg heter Ola, tlf 12345678"
Du: "Hei Ola! 😊 Takk! Kan jeg også få e-postadressen din?"
[VIKTIG: E-post er obligatorisk - må alltid spørres om!]

...og så videre naturlig.

## Viktig
- Hold oversikt over hva du allerede har fått vite
- Ikke spør om samme ting to ganger
- Vær tålmodig hvis brukeren gir info i feil rekkefølge
- Tilpass samtalen til brukeren`
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Melding er påkrevd' },
        { status: 400 }
      )
    }

    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME

    if (!deploymentName) {
      return NextResponse.json(
        { error: 'Azure OpenAI deployment er ikke konfigurert' },
        { status: 500 }
      )
    }

    // Bygg meldingshistorikk
    const messages: Message[] = [
      {
        role: 'system',
        content: createSystemPrompt()
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ]

    // Definer funksjoner som AI kan kalle
    const functions = [
      {
        name: 'validate_address',
        description: 'Validerer en norsk adresse mot Google Maps. Returnerer verifisert adresse, kommune, koordinater eller forslag hvis adressen ikke finnes.',
        parameters: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Adressen som skal valideres (f.eks. "Tastavägen 45, Stavanger")'
            }
          },
          required: ['address']
        }
      }
    ]

    // Kall Azure OpenAI med historikk og funksjoner
    const client = getAzureClient()
    const result = await client.chat.completions.create({
      model: deploymentName,
      messages: messages,
      temperature: 0.8,
      max_tokens: 800,
      tools: functions.map(fn => ({
        type: 'function' as const,
        function: fn
      })),
      tool_choice: 'auto'
    })

    const aiMessage = result.choices[0]?.message

    // Sjekk om AI vil kalle en funksjon
    if (aiMessage?.tool_calls && aiMessage.tool_calls.length > 0) {
      const toolCall = aiMessage.tool_calls[0]

      if (toolCall.type === 'function' && toolCall.function.name === 'validate_address') {
        // Parse argumenter
        const args = JSON.parse(toolCall.function.arguments)

        // Kall Google Maps API direkte
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        let validateResult: Record<string, unknown> = {}

        if (!apiKey) {
          validateResult = {
            success: false,
            message: 'Google Maps API key mangler'
          }
        } else {
          try {
            // STEG 1: Prøv ALLTID autocomplete først for å finne liknende adresser (mer tolerant for feil)
            const autocompleteResult = await mapsClient.placeAutocomplete({
              params: {
                input: args.address,
                components: ['country:no'],
                key: apiKey
              }
            })

            // STEG 2: Prøv å geocode den oppgitte adressen
            const geocodeResult = await mapsClient.geocode({
              params: {
                address: args.address,
                region: 'NO',
                components: {
                  country: 'NO'
                },
                key: apiKey
              }
            })

            // Hvis geocoding feiler eller er upresist, vis autocomplete-forslag
            if (geocodeResult.data.results.length === 0 ||
                (autocompleteResult.data.predictions.length > 0 &&
                 geocodeResult.data.results[0].geometry.location_type !== 'ROOFTOP' &&
                 geocodeResult.data.results[0].geometry.location_type !== 'RANGE_INTERPOLATED')) {

              if (autocompleteResult.data.predictions.length > 0) {
                const suggestions = autocompleteResult.data.predictions
                  .slice(0, 5)  // Økt fra 3 til 5 forslag
                  .map(p => p.description)

                validateResult = {
                  success: false,
                  suggestions: suggestions,
                  message: 'Fant ikke eksakt adresse. Her er forslag basert på det du skrev:'
                }
              } else {
                validateResult = {
                  success: false,
                  suggestions: [],
                  message: 'Kunne ikke finne adressen. Vennligst sjekk stavemåten.'
                }
              }
            } else {
              // Adresse funnet - hent detaljert info
              const result = geocodeResult.data.results[0]
              const formattedAddress = result.formatted_address

              // Ekstraher kommune og fylke
              let kommune = null
              let fylke = null
              for (const component of result.address_components) {
                const types = component.types as string[]
                // Kommune kan være i flere felt avhengig av adresse
                if (types.includes('administrative_area_level_2')) {
                  kommune = component.long_name
                }
                // Fallback til postal_town eller locality hvis level_2 ikke finnes
                if (!kommune && (types.includes('postal_town') || types.includes('locality'))) {
                  kommune = component.long_name
                }
                if (types.includes('administrative_area_level_1')) {
                  fylke = component.long_name
                }
              }

              console.log('🔍 Adressevalidering:', {
                adresse: formattedAddress,
                kommune,
                fylke,
                address_components: result.address_components.map(c => ({ name: c.long_name, types: c.types }))
              })

              // Liste over godkjente kommuner for 110 Sør-Vest
              const godkjenteKommuner = [
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

              // Sjekk om adressen er i et godkjent område
              const isValidLocation = (fylke === 'Rogaland' || fylke === 'Vestland' || fylke === 'Agder') &&
                                      kommune && godkjenteKommuner.includes(kommune)

              if (!isValidLocation) {
                validateResult = {
                  success: false,
                  message: `Adressen ligger i ${kommune ? kommune + ', ' : ''}${fylke || 'et område'} som ikke dekkes av 110 Sør-Vest. Dette systemet er kun for bålmeldinger i vårt dekningsområde.`,
                  outsideRogaland: true
                }
              } else {
                validateResult = {
                  success: true,
                  verified: {
                    address: formattedAddress,
                    kommune: kommune,
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng
                  }
                }
              }
            }
          } catch (error) {
            console.error('Google Maps API error:', error)
            validateResult = {
              success: false,
              message: 'Feil ved adressevalidering'
            }
          }
        }

        // Legg til funksjonsresultat i meldingshistorikk
        const messagesWithFunction: Message[] = [
          ...messages,
          {
            role: 'assistant',
            content: JSON.stringify(aiMessage)
          },
          {
            role: 'user',
            content: `Funksjonsresultat for validate_address: ${JSON.stringify(validateResult)}`
          }
        ]

        // Kall AI igjen med funksjonsresultatet
        const secondResult = await client.chat.completions.create({
          model: deploymentName,
          messages: messagesWithFunction,
          temperature: 0.8,
          max_tokens: 800,
        })

        const aiResponse = secondResult.choices[0]?.message?.content || 'Beklager, jeg kunne ikke generere et svar.'

        // Sjekk om bålmelding er klar for lagring
        const isComplete = aiResponse.includes('---BALMELDING_KLAR---')
        let saved = false
        let finalResponse = aiResponse

        if (isComplete) {
          // Fjern JSON-delen fra respons som vises til bruker FØRST
          const textBeforeJson = aiResponse.split('---BALMELDING_KLAR---')[0].trim()

          // Parse og lagre bålmelding
          const saveResult = await saveBonfireNotification(aiResponse)
          if (saveResult.success) {
            saved = true
            finalResponse = textBeforeJson
          } else {
            // Selv ved feil, vis ALDRI JSON-data til bruker
            finalResponse = textBeforeJson + '\n\n⚠️ Det oppstod en feil ved lagring av meldingen. Vennligst prøv igjen eller kontakt 110 Sør-Vest direkte.'
          }
        }

        return NextResponse.json({
          response: finalResponse,
          saved: saved
        })
      }
    }

    const aiResponse = aiMessage?.content || 'Beklager, jeg kunne ikke generere et svar.'

    // Sjekk om bålmelding er klar for lagring
    const isComplete = aiResponse.includes('---BALMELDING_KLAR---')
    let saved = false
    let finalResponse = aiResponse

    if (isComplete) {
      // Fjern JSON-delen fra respons som vises til bruker FØRST
      const textBeforeJson = aiResponse.split('---BALMELDING_KLAR---')[0].trim()

      // Parse og lagre bålmelding
      const saveResult = await saveBonfireNotification(aiResponse)
      if (saveResult.success) {
        saved = true
        finalResponse = textBeforeJson
      } else {
        // Selv ved feil, vis ALDRI JSON-data til bruker
        finalResponse = textBeforeJson + '\n\n⚠️ Det oppstod en feil ved lagring av meldingen. Vennligst prøv igjen eller kontakt 110 Sør-Vest direkte.'
      }
    }

    return NextResponse.json({
      response: finalResponse,
      saved: saved
    })
  } catch (error) {
    console.error('Azure OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Kunne ikke kommunisere med AI-tjenesten' },
      { status: 500 }
    )
  }
}

async function saveBonfireNotification(aiResponse: string) {
  try {
    // Finn JSON mellom markørene
    const pattern = /---BALMELDING_KLAR---([\s\S]*?)---SLUTT---/
    const match = aiResponse.match(pattern)

    if (!match) {
      console.error('Fant ikke JSON i AI-respons')
      return { success: false, error: 'JSON ikke funnet' }
    }

    const jsonStr = match[1].trim()
    const data = JSON.parse(jsonStr)

    // Valider påkrevde felter
    const required = ['navn', 'telefon', 'epost', 'adresse', 'kommune', 'balstorrelse', 'type']
    const missingFields = required.filter(field => !data[field])

    if (missingFields.length > 0) {
      console.error('Mangler påkrevde felter:', missingFields)
      return { success: false, error: 'Mangler påkrevde felter' }
    }

    // Valider e-postformat
    if (data.epost && !data.epost.includes('@')) {
      console.error('Ugyldig e-postadresse (mangler @):', data.epost)
      return { success: false, error: 'Ugyldig e-postadresse' }
    }

    // Lagre til Azure Table Storage
    console.log('📍 Lagrer til Azure med koordinater:', { lat: data.lat, lng: data.lng, adresse: data.adresse })
    const azureId = await createBonfireInAzure({
      navn: data.navn,
      telefon: data.telefon,
      epost: data.epost || '',
      adresse: data.adresse,
      kommune: data.kommune,
      latitude: data.lat || 0,
      longitude: data.lng || 0,
      balstorrelse: data.balstorrelse,
      type: data.type,
      fra: data.fra,
      til: data.til,
      beskrivelse: data.beskrivelse || 'Registrert via AI-chat',
    })
    console.log('✅ Bålmelding lagret i Azure Tables! RowKey:', azureId)

    return { success: true, id: azureId }

  } catch (error) {
    console.error('❌ Feil ved lagring:', error)
    return { success: false, error: String(error) }
  }
}
