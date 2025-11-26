'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'

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

// Flamme SVG komponent - grønn for fremtidig, rød for aktiv, gul for utløpt
type BonfireStatus = 'future' | 'active' | 'expired'

function FlameIcon({ status }: { status: BonfireStatus }) {
  // Grønn for fremtidig, rød for aktiv, gul for utløpt
  const colors = {
    future: { outer: '#22C55E', inner: '#86EFAC' },   // Grønn
    active: { outer: '#EF4444', inner: '#FCA5A5' },   // Rød
    expired: { outer: '#F59E0B', inner: '#FDE047' }   // Gul
  }
  const { outer, inner } = colors[status]

  return (
    <svg
      width="32"
      height="40"
      viewBox="0 0 24 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer hover:scale-110 transition-transform drop-shadow-lg"
    >
      {/* Flamme form */}
      <path
        d="M12 2C12 2 4 10 4 16C4 20.4183 7.58172 24 12 24C16.4183 24 20 20.4183 20 16C20 10 12 2 12 2Z"
        fill={outer}
        stroke="white"
        strokeWidth="1.5"
      />
      {/* Indre flamme */}
      <path
        d="M12 8C12 8 8 13 8 16C8 18.2091 9.79086 20 12 20C14.2091 20 16 18.2091 16 16C16 13 12 8 12 8Z"
        fill={inner}
      />
    </svg>
  )
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
            <FlameIcon status={status} />
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
          mapId="bonfire-map"
          style={{ width: '100%', height: '100%' }}
        >
          <BonfireMarkers bonfires={bonfires} />
        </Map>
      </APIProvider>
    </div>
  )
}
