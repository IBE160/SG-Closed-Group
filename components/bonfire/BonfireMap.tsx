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
import { APIProvider, Map, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'

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
          <Marker
            key={bonfire.id}
            position={{ lat: Number(bonfire.latitude), lng: Number(bonfire.longitude) }}
            onClick={() => handleMarkerClick(bonfire)}
            icon={getMarkerIcon(status)}
          />
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
 * MapSearchBox - Søkefelt med Google Places Autocomplete
 * Lar brukeren søke etter steder og panorere kartet dit
 */
function MapSearchBox() {
  const map = useMap()
  const placesLib = useMapsLibrary('places')
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialiser Google Places Autocomplete
  useEffect(() => {
    if (!placesLib || !inputRef.current || isInitialized) return

    try {
      const autocompleteInstance = new placesLib.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'no' }, // Begrens til Norge
        fields: ['geometry', 'name', 'formatted_address'],
        types: ['geocode', 'establishment'] // Adresser og steder/virksomheter
      })

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace()

        if (place.geometry?.location && map) {
          const location = place.geometry.location

          // Panorer kartet til valgt sted
          map.panTo(location)

          // Zoom inn basert på stedtype
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport)
          } else {
            map.setZoom(15) // Standard zoom for enkeltpunkt
          }

          // Oppdater søkefeltet med valgt sted
          setSearchValue(place.formatted_address || place.name || '')
        }
      })

      setIsInitialized(true)

      return () => {
        // Cleanup - fjern listener
        if (autocompleteInstance) {
          google.maps.event.clearInstanceListeners(autocompleteInstance)
        }
      }
    } catch (err) {
      console.error('Failed to initialize Places Autocomplete:', err)
      setError('Søkefunksjon ikke tilgjengelig')
    }
  }, [placesLib, map, isInitialized])

  // Håndter tømming av søkefeltet
  const handleClear = () => {
    setSearchValue('')
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }

  // Hvis Places API ikke er tilgjengelig, ikke vis søkefeltet
  if (!placesLib) {
    return null
  }

  return (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 w-80">
      <div className="relative">
        {/* Søkeikon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Søkefelt */}
        <input
          ref={inputRef}
          type="text"
          placeholder={error || "Søk etter sted..."}
          className={`w-full pl-10 pr-10 py-2 bg-white border rounded shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 text-sm ${error ? 'border-red-300 placeholder-red-400' : 'border-gray-300'}`}
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={!!error}
        />

        {/* Tøm-knapp */}
        {searchValue && !error && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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

export default function BonfireMap() {
  const [bonfires, setBonfires] = useState<BonfireNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
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

      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={10}
          mapTypeId={mapType}
          onMapTypeIdChanged={(e) => {
            if (e.map.getMapTypeId()) {
              handleMapTypeChange(e.map.getMapTypeId()!)
            }
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <MapSearchBox />
          <BonfireMarkers bonfires={bonfires} />
        </Map>
      </APIProvider>
    </div>
  )
}
