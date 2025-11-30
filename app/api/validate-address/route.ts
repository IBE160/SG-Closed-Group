import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client({})

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json(
        { error: 'Adresse mangler' },
        { status: 400 }
      )
    }

    // Use server-side API key (no referrer restrictions) or fall back to public key
    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key mangler' },
        { status: 500 }
      )
    }

    try {
      // STEG 1: Prøv ALLTID autocomplete først for å finne liknende adresser (mer tolerant for feil)
      const autocompleteResult = await client.placeAutocomplete({
        params: {
          input: address,
          components: ['country:no'],
          key: apiKey
        }
      })

      // STEG 2: Prøv å geocode den oppgitte adressen
      const geocodeResult = await client.geocode({
        params: {
          address: address,
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

          return NextResponse.json({
            success: false,
            suggestions: suggestions,
            message: 'Fant ikke eksakt adresse. Her er forslag basert på det du skrev:'
          })
        }

        return NextResponse.json({
          success: false,
          suggestions: [],
          message: 'Kunne ikke finne adressen. Vennligst sjekk stavemåten.'
        })
      }

      // Adresse funnet - hent detaljert info
      const result = geocodeResult.data.results[0]
      const formattedAddress = result.formatted_address

      // Ekstraher kommune og fylke
      let kommune = null
      let fylke = null

      for (const component of result.address_components) {
        const types = component.types as string[]
        if (types.includes('postal_town') || types.includes('locality')) {
          kommune = component.long_name
        }
        if (types.includes('administrative_area_level_1')) {
          fylke = component.long_name
        }
      }

      // Liste over godkjente kommuner for 110 Sør-Vest
      const godkjenteKommuner = [
        // Rogaland (23 kommuner)
        'Stavanger', 'Sandnes', 'Sola', 'Randaberg', 'Strand', 'Gjesdal',
        'Klepp', 'Time', 'Hå', 'Eigersund', 'Sokndal', 'Lund', 'Bjerkreim',
        'Hjelmeland', 'Suldal', 'Sauda', 'Kvitsøy', 'Bokn', 'Tysvær',
        'Karmøy', 'Haugesund', 'Vindafjord', 'Etne',
        // Vestland (5 kommuner)
        'Bømlo', 'Stord', 'Fitjar', 'Sveio',
        // Agder (1 kommune)
        'Sirdal'
      ]

      // Sjekk om adressen er i et godkjent område
      const isValidLocation = (fylke === 'Rogaland' || fylke === 'Vestland' || fylke === 'Agder') &&
                              kommune && godkjenteKommuner.includes(kommune)

      if (!isValidLocation) {
        return NextResponse.json({
          success: false,
          message: `Adressen ligger i ${kommune ? kommune + ', ' : ''}${fylke || 'et område'} som ikke dekkes av 110 Sør-Vest. Dette systemet er kun for bålmeldinger i vårt dekningsområde (deler av Rogaland, Vestland og Agder).`,
          outsideRogaland: true
        })
      }

      return NextResponse.json({
        success: true,
        verified: {
          address: formattedAddress,
          kommune: kommune,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      })

    } catch (error) {
      console.error('Google Maps API error:', error)
      return NextResponse.json(
        { error: 'Feil ved adressevalidering', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Request parsing error:', error)
    return NextResponse.json(
      { error: 'Ugyldig forespørsel' },
      { status: 400 }
    )
  }
}
