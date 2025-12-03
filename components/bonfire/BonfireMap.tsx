/**
 * Bonfire Map Component
 *
 * Epic 5 Vol.2: Interaktivt kart med bålmeldinger og søkefunksjon
 *
 * Funksjoner:
 * - Google Maps med bålmelding-markører (flammeikoner)
 * - Søkefelt med Google Places Autocomplete
 * - Klikk på søkeresultat → kart panorerer til stedet
 * - Fargekodede markører: grønn (planlagt), rød (aktiv), gul (utløpt)
 *
 * @see docs/sprint-artifacts/epic-5-vol-2/tech-spec.md
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'

interface BonfireNotification {
  id: string
  name: string
  phone: string
  email: string
  address: string
  municipality: string
  latitude: number
  longitude: number
  bonfireType: string
  bonfireCategory: string
  dateFrom?: string
  dateTo?: string
  description?: string
  createdAt?: string
}

// Bålstatus typer - grønn for fremtidig, rød for aktiv, gul for utløpt
type BonfireStatus = 'future' | 'active' | 'expired'

// Marker ikoner som data URLs (SVG flamme)
function getMarkerIcon(status: BonfireStatus): string {
  const colors = {
    future: { outer: '%2322C55E', inner: '%2386EFAC' },   // Grønn (URL-encoded)
    active: { outer: '%23EF4444', inner: '%23FCA5A5' },   // Rød
    expired: { outer: '%23F59E0B', inner: '%23FDE047' }   // Gul
  }
  const { outer, inner } = colors[status]

  // SVG som data URL
  return `data:image/svg+xml,${encodeURIComponent(`<svg width="32" height="40" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 4 10 4 16C4 20.4183 7.58172 24 12 24C16.4183 24 20 20.4183 20 16C20 10 12 2 12 2Z" fill="${decodeURIComponent(outer)}" stroke="white" stroke-width="1.5"/><path d="M12 8C12 8 8 13 8 16C8 18.2091 9.79086 20 12 20C14.2091 20 16 18.2091 16 16C16 13 12 8 12 8Z" fill="${decodeURIComponent(inner)}"/></svg>`)}`
}

// Sjekk bålstatus basert på tid: fremtidig, aktiv eller utløpt
function getBonfireStatus(dateFrom?: string, dateTo?: string): BonfireStatus {
  const now = new Date()

  try {
    if (dateFrom) {
      const startDate = new Date(dateFrom)
      if (now < startDate) return 'future' // Ikke startet enda
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      if (now > endDate) return 'expired' // Utløpt
    }

    return 'active' // Pågår nå
  } catch {
    return 'active'
  }
}

function BonfireMarkers({ bonfires }: { bonfires: BonfireNotification[] }) {
  const [selectedBonfire, setSelectedBonfire] = useState<BonfireNotification | null>(null)
  const map = useMap()

  const handleMarkerClick = useCallback((bonfire: BonfireNotification) => {
    setSelectedBonfire(bonfire)
    if (map) {
      map.panTo({ lat: Number(bonfire.latitude), lng: Number(bonfire.longitude) })
    }
  }, [map])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('nb-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatRegisteredDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('nb-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <>
      {bonfires.map((bonfire) => {
        const status = getBonfireStatus(bonfire.dateFrom, bonfire.dateTo)
        return (
          <AdvancedMarker
            key={bonfire.id}
            position={{ lat: Number(bonfire.latitude), lng: Number(bonfire.longitude) }}
            onClick={() => handleMarkerClick(bonfire)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getMarkerIcon(status)} alt="Bålmarkør" width={32} height={40} />
          </AdvancedMarker>
        )
      })}

      {selectedBonfire && (
        <InfoWindow
          position={{ lat: Number(selectedBonfire.latitude), lng: Number(selectedBonfire.longitude) }}
          onCloseClick={() => setSelectedBonfire(null)}
          pixelOffset={[0, -40]}
        >
          <div className="p-2 min-w-[280px] max-w-[320px]">
            {/* Header - grønn for fremtidig, rød for aktiv, gul for utløpt */}
            {(() => {
              const status = getBonfireStatus(selectedBonfire.dateFrom, selectedBonfire.dateTo)
              const statusConfig = {
                future: { bg: 'bg-green-500', text: 'BÅLMELDING (PLANLAGT)' },
                active: { bg: 'bg-red-500', text: 'BÅLMELDING' },
                expired: { bg: 'bg-amber-500', text: 'BÅLMELDING (UTLØPT)' }
              }
              const { bg, text } = statusConfig[status]
              return (
                <div className={`${bg} text-white px-3 py-1 rounded text-sm font-semibold mb-3 inline-flex items-center gap-2`}>
                  <span>🔥</span> {text}
                </div>
              )
            })()}

            {/* Navn */}
            <h3 className="text-lg font-bold text-gray-900 mb-3">{selectedBonfire.name}</h3>

            {/* Detaljer */}
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-semibold">Telefon:</span> {selectedBonfire.phone}</p>
              <p><span className="font-semibold">E-post:</span> {selectedBonfire.email}</p>
              <p><span className="font-semibold">Adresse:</span> {selectedBonfire.address}</p>
              <p><span className="font-semibold">Kommune:</span> {selectedBonfire.municipality}</p>
              <p><span className="font-semibold">Bålstørrelse:</span> {selectedBonfire.bonfireType}</p>
              <p><span className="font-semibold">Type:</span> {selectedBonfire.bonfireCategory}</p>
              <p><span className="font-semibold">Fra:</span> {formatDate(selectedBonfire.dateFrom)}</p>
              <p><span className="font-semibold">Til:</span> {formatDate(selectedBonfire.dateTo)}</p>
              {selectedBonfire.description && (
                <p><span className="font-semibold">Beskrivelse:</span> {selectedBonfire.description}</p>
              )}
            </div>

            {/* Registrert */}
            <p className="text-xs text-gray-500 mt-3">
              Registrert: {formatRegisteredDate(selectedBonfire.createdAt)}
            </p>

            {/* Link til Google Maps */}
            <a
              href={`https://www.google.com/maps?q=${selectedBonfire.latitude},${selectedBonfire.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            >
              Åpne i Google Maps →
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

/**
 * MapSearchBox - Søkefelt med Google Places Autocomplete (stabil API)
 * Bruker den klassiske Autocomplete API-en som er velprøvd og stabil
 * Lar brukeren søke etter steder og panorere kartet dit
 */
function MapSearchBox({ onAreaSelect }: { onAreaSelect?: (placeId: string | null) => void }) {
  const map = useMap()
  const placesLib = useMapsLibrary('places')
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const searchMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Initialiser Google Places Autocomplete (klassisk, stabil API)
  useEffect(() => {
    const input = inputRef.current
    if (!placesLib || !input) return

    // Sjekk om autocomplete allerede er initialisert
    if (autocompleteRef.current) {
      return
    }

    try {
      // Opprett Autocomplete (klassisk API - stabil og pålitelig)
      const autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'no' },
        fields: ['formatted_address', 'geometry', 'place_id', 'name', 'types'],
        types: ['geocode', 'establishment']
      })

      // Bias søk mot Rogaland-området
      const rogalandBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(58.5, 5.2),  // Sørvest
        new google.maps.LatLng(59.5, 6.5)   // Nordøst
      )
      autocomplete.setBounds(rogalandBounds)

      autocompleteRef.current = autocomplete
      console.log('✅ Autocomplete (klassisk API) initialisert')

      // Lytt på place_changed event
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        console.log('🔍 Place selected:', place)

        if (!place.geometry?.location) {
          console.warn('Ingen geometri for valgt sted')
          return
        }

        const location = place.geometry.location

        if (map) {
          console.log('📍 Moving map to:', location.lat(), location.lng())

          // Panorer kartet til valgt sted
          map.panTo(location)

          // Zoom inn basert på viewport eller standard zoom
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport)
          } else {
            map.setZoom(14)
          }

          // Oppdater input-verdi
          setInputValue(place.formatted_address || place.name || '')

          // Fjern eksisterende søkemarkør
          if (searchMarkerRef.current) {
            searchMarkerRef.current.map = null
          }

          // Lag markør for søkeresultat (blå sirkel)
          const markerContent = document.createElement('div')
          markerContent.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="#FFFFFF" stroke-width="3"/>
            </svg>
          `

          searchMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
            position: location,
            map,
            content: markerContent,
            title: place.formatted_address || place.name || 'Søkeresultat',
            zIndex: 1000
          })

          // Send place_id til parent for områdegrense
          if (onAreaSelect && place.place_id) {
            onAreaSelect(place.place_id)
          }
        }
      })

    } catch (err) {
      console.error('Failed to initialize Places Autocomplete:', err)
    }

    return () => {
      if (searchMarkerRef.current) {
        searchMarkerRef.current.map = null
        searchMarkerRef.current = null
      }
      // Google Autocomplete fjernes automatisk når input-elementet unmountes
      autocompleteRef.current = null
    }
  }, [placesLib, map, onAreaSelect])

  // Tøm søket
  const handleClear = useCallback(() => {
    setInputValue('')
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }

    if (searchMarkerRef.current) {
      searchMarkerRef.current.map = null
      searchMarkerRef.current = null
    }

    if (onAreaSelect) {
      onAreaSelect(null)
    }
  }, [onAreaSelect])

  if (!placesLib) {
    return null
  }

  return (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 w-80">
      <div className="relative bg-white rounded shadow-md overflow-hidden">
        {/* Søkeikon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input-felt */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Søk etter sted..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full h-10 pl-10 pr-10 border-0 outline-none text-gray-800 text-sm bg-transparent"
        />

        {/* Tøm-knapp */}
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 z-10"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * AreaBoundary - Tegner områdegrenser med Data-driven styling
 * Bruker Google Maps Feature Layers for ekte polygongrenser
 * Fallback til viewport-basert firkant hvis Feature Layers ikke er tilgjengelig
 */
function AreaBoundary({ placeId }: { placeId: string | null }) {
  const map = useMap()
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featureLayerRef = useRef<any>(null)
  const previousPlaceIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!map) return

    // Fjern eksisterende polyline (fallback grense)
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }

    // Reset feature layer styling hvis placeId endres
    if (featureLayerRef.current && previousPlaceIdRef.current !== placeId) {
      try {
        featureLayerRef.current.style = null
      } catch (e) {
        console.log('Could not reset feature layer style:', e)
      }
    }
    previousPlaceIdRef.current = placeId

    if (!placeId) return

    // Prøv Data-driven styling (krever Map ID med Feature Layers aktivert)
    // Men tegn alltid fallback-grense i tillegg for synlighet
    try {
      // @ts-expect-error - getFeatureLayer er en ny API som ikke er i typene ennå
      const localityLayer = map.getFeatureLayer('LOCALITY')

      if (localityLayer) {
        console.log('🗺️ Applying Data-driven styling for boundary')
        featureLayerRef.current = localityLayer

        // Style kun det valgte området
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        localityLayer.style = (params: any) => {
          if (params.feature?.placeId === placeId) {
            return {
              strokeColor: '#E53935',
              strokeOpacity: 1.0,
              strokeWeight: 3,
              fillColor: '#E53935',
              fillOpacity: 0.1
            }
          }
          return null // Ingen styling for andre områder
        }
        // Fortsett til fallback for å sikre synlig grense
      }
    } catch (e) {
      console.log('Feature Layers not available:', e)
    }

    // Tegn alltid viewport-basert firkant som synlig grense
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0]
        console.log('📍 Using viewport fallback for boundary:', result.formatted_address)

        if (result.geometry.viewport) {
          const bounds = result.geometry.viewport
          const ne = bounds.getNorthEast()
          const sw = bounds.getSouthWest()

          const path = [
            { lat: ne.lat(), lng: sw.lng() },
            { lat: ne.lat(), lng: ne.lng() },
            { lat: sw.lat(), lng: ne.lng() },
            { lat: sw.lat(), lng: sw.lng() },
            { lat: ne.lat(), lng: sw.lng() }
          ]

          const dashedLineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            strokeColor: '#E53935',
            scale: 3
          }

          polylineRef.current = new google.maps.Polyline({
            path,
            strokeOpacity: 0,
            icons: [{
              icon: dashedLineSymbol,
              offset: '0',
              repeat: '15px'
            }],
            map
          })
          console.log('📍 Drew boundary rectangle for:', result.formatted_address)
        }
      }
    })

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
      }
      if (featureLayerRef.current) {
        try {
          featureLayerRef.current.style = null
        } catch (e) {
          console.log('Could not reset feature layer on cleanup:', e)
        }
      }
    }
  }, [map, placeId])

  return null
}

// Google Cloud Map ID med Data-driven styling aktivert
const GOOGLE_MAP_ID = 'b392a2418028c323ddc77d62'

export default function BonfireMap() {
  const [bonfires, setBonfires] = useState<BonfireNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [selectedAreaPlaceId, setSelectedAreaPlaceId] = useState<string | null>(null)
  const [mapType, setMapType] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bonfireMapType') || 'hybrid'
    }
    return 'hybrid'
  })
  const defaultCenter = { lat: 59.1492, lng: 5.6937 }

  const handleMapTypeChange = (newMapType: string) => {
    setMapType(newMapType)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bonfireMapType', newMapType)
    }
  }

  useEffect(() => {
    fetchBonfires()
  }, [])

  useEffect(() => {
    setPortalContainer(document.getElementById('bonfire-count-portal'))
  }, [])

  const fetchBonfires = async () => {
    try {
      const response = await fetch('/api/bonfires')
      if (!response.ok) throw new Error('Feil')

      const data = await response.json()
      // Filtrer ut bål med ugyldige koordinater (0,0 eller null)
      const validBonfires = data.filter((bonfire: BonfireNotification) => {
        const lat = Number(bonfire.latitude)
        const lng = Number(bonfire.longitude)
        return lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)
      })
      setBonfires(validBonfires)
    } catch (error) {
      console.error('Feil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <p>Laster kart...</p>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      {portalContainer && createPortal(
        <span className="text-white font-semibold">Bålmeldinger: {bonfires.length}</span>,
        portalContainer
      )}

      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} version="beta">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={10}
          mapId={GOOGLE_MAP_ID}
          mapTypeId={mapType}
          onMapTypeIdChanged={(e) => {
            if (e.map.getMapTypeId()) {
              handleMapTypeChange(e.map.getMapTypeId()!)
            }
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <MapSearchBox onAreaSelect={setSelectedAreaPlaceId} />
          <AreaBoundary placeId={selectedAreaPlaceId} />
          <BonfireMarkers bonfires={bonfires} />
        </Map>
      </APIProvider>
    </div>
  )
}
