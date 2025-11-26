'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Innmelding {
  rowKey: string
  navn?: string
  telefon?: string
  epost?: string
  adresse?: string
  kommune?: string
  latitude?: number
  longitude?: number
  balstorrelse?: string
  type?: string
  fra?: string
  til?: string
  beskrivelse?: string
  timestamp: string
  godkjent: boolean
}

declare global {
  interface Window {
    google: any
  }
}

export default function AdminKart() {
  const [innmeldinger, setInnmeldinger] = useState<Innmelding[]>([])
  const [pendingInnmeldinger, setPendingInnmeldinger] = useState<Innmelding[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [currentPending, setCurrentPending] = useState<Innmelding | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchApprovedInnmeldinger()
    checkForPending()

    // Poll for new pending every 10 seconds
    pollIntervalRef.current = setInterval(() => {
      checkForPending()
    }, 10000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoading && mapRef.current && !googleMapRef.current) {
      initializeMap()
    }
  }, [isLoading])

  // Update map when innmeldinger changes
  useEffect(() => {
    if (googleMapRef.current && innmeldinger.length >= 0) {
      createMap()
    }
  }, [innmeldinger])

  const fetchApprovedInnmeldinger = async () => {
    try {
      const response = await fetch('/api/admin/bonfires')

      if (response.status === 401) {
        router.push('/admin')
        return
      }

      if (!response.ok) {
        throw new Error('Kunne ikke hente innmeldinger')
      }

      const data = await response.json()

      const medKoordinater = data.bonfires.filter(
        (inn: Innmelding) => inn.latitude && inn.longitude
      )

      setInnmeldinger(medKoordinater)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const checkForPending = async () => {
    try {
      const response = await fetch('/api/admin/pending')

      if (!response.ok) return

      const data = await response.json()

      if (data.pending && data.pending.length > 0) {
        setPendingInnmeldinger(data.pending)

        // Show notification for first pending item
        if (!showNotification && data.pending[0]) {
          setCurrentPending(data.pending[0])
          setShowNotification(true)
        }
      } else {
        setPendingInnmeldinger([])
      }
    } catch (error) {
      console.error('Feil ved sjekk av ventende:', error)
    }
  }

  const handleApprove = async () => {
    if (!currentPending) return

    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowKey: currentPending.rowKey })
      })

      if (response.ok) {
        const newPending = pendingInnmeldinger.filter(p => p.rowKey !== currentPending.rowKey)
        setPendingInnmeldinger(newPending)

        if (newPending.length > 0) {
          setCurrentPending(newPending[0])
        } else {
          setShowNotification(false)
          setCurrentPending(null)
        }

        // Refresh approved innmeldinger and update map
        await fetchApprovedInnmeldinger()
      }
    } catch (error) {
      console.error('Feil ved godkjenning:', error)
    }
  }

  const handleReject = async () => {
    if (!currentPending) return

    try {
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowKey: currentPending.rowKey })
      })

      if (response.ok) {
        const newPending = pendingInnmeldinger.filter(p => p.rowKey !== currentPending.rowKey)
        setPendingInnmeldinger(newPending)

        if (newPending.length > 0) {
          setCurrentPending(newPending[0])
        } else {
          setShowNotification(false)
          setCurrentPending(null)
        }
      }
    } catch (error) {
      console.error('Feil ved avslag:', error)
    }
  }

  const initializeMap = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,places&v=weekly`
      script.async = true
      script.defer = true
      script.onload = () => createMap()
      document.head.appendChild(script)
    } else {
      createMap()
    }
  }

  const createMap = () => {
    if (!mapRef.current || !window.google) return

    const center = innmeldinger.length > 0
      ? { lat: innmeldinger[0].latitude!, lng: innmeldinger[0].longitude! }
      : { lat: 59.0, lng: 6.0 }

    // Create or update map
    if (!googleMapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 10,
      })
      googleMapRef.current = map
    }

    const map = googleMapRef.current

    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const infoWindow = new window.google.maps.InfoWindow()

    innmeldinger.forEach((innmelding) => {
      // Bestem markør-farge basert på om det er bål-relatert
      const erBal = innmelding.balstorrelse || innmelding.type

      const marker = new window.google.maps.Marker({
        position: { lat: innmelding.latitude!, lng: innmelding.longitude! },
        map: map,
        title: innmelding.navn || 'Innmelding',
        icon: erBal ? {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF4444', // Rød for bål
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        } : undefined, // Standard blå markør for andre
      })

      marker.addListener('click', () => {
        const contentString = `
          <div style="padding: 10px; max-width: 300px;">
            ${erBal ? '<div style="background: #EF4444; color: white; padding: 8px; margin: -10px -10px 10px -10px; border-radius: 4px 4px 0 0;"><strong>🔥 BÅLMELDING</strong></div>' : ''}
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${innmelding.navn || 'Innmelding'}</h3>
            ${innmelding.telefon ? `<p style="margin: 4px 0;"><strong>Telefon:</strong> ${innmelding.telefon}</p>` : ''}
            ${innmelding.epost ? `<p style="margin: 4px 0;"><strong>E-post:</strong> ${innmelding.epost}</p>` : ''}
            ${innmelding.adresse ? `<p style="margin: 4px 0;"><strong>Adresse:</strong> ${innmelding.adresse}</p>` : ''}
            ${innmelding.kommune ? `<p style="margin: 4px 0;"><strong>Kommune:</strong> ${innmelding.kommune}</p>` : ''}
            ${innmelding.balstorrelse ? `<p style="margin: 4px 0;"><strong>Bålstørrelse:</strong> ${innmelding.balstorrelse}</p>` : ''}
            ${innmelding.type ? `<p style="margin: 4px 0;"><strong>Type:</strong> ${innmelding.type}</p>` : ''}
            ${innmelding.fra ? `<p style="margin: 4px 0;"><strong>Fra:</strong> ${innmelding.fra}</p>` : ''}
            ${innmelding.til ? `<p style="margin: 4px 0;"><strong>Til:</strong> ${innmelding.til}</p>` : ''}
            ${innmelding.beskrivelse ? `<p style="margin: 4px 0;"><strong>Beskrivelse:</strong> ${innmelding.beskrivelse}</p>` : ''}
            <p style="margin-top: 8px; font-size: 12px; color: #666;">
              Registrert: ${new Date(innmelding.timestamp).toLocaleString('nb-NO')}
            </p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${innmelding.latitude},${innmelding.longitude}"
               target="_blank"
               style="display: inline-block; margin-top: 8px; color: #3B82F6; text-decoration: underline;">
              Åpne i Google Maps →
            </a>
          </div>
        `
        infoWindow.setContent(contentString)
        infoWindow.open(map, marker)
      })

      markersRef.current.push(marker)
    })
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Laster innmeldinger...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">Feil: {error}</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">110 Sør-Vest - Innmeldinger</h1>
          <p className="text-sm text-red-100">
            Totalt {innmeldinger.length} godkjente innmeldinger
            {pendingInnmeldinger.length > 0 && ` • ${pendingInnmeldinger.length} venter på godkjenning`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
          >
            Logg ut
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 w-full" style={{ position: 'relative', minHeight: '600px' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      </div>

      {innmeldinger.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600">Ingen godkjente innmeldinger ennå.</p>
        </div>
      )}

      {/* Notification Popup */}
      {showNotification && currentPending && (
        <div className="fixed top-20 right-6 bg-white rounded-lg shadow-2xl border-2 border-red-600 w-96 z-50">
          <div className="bg-red-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-lg">🔔 Ny innmelding</h3>
            <p className="text-sm text-red-100">Krever din godkjenning</p>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <p className="font-semibold text-lg mb-2">{currentPending.navn || 'Ukjent'}</p>
              {currentPending.telefon && <p className="text-sm text-gray-600">📞 {currentPending.telefon}</p>}
              {currentPending.epost && <p className="text-sm text-gray-600">✉️ {currentPending.epost}</p>}
              {currentPending.adresse && <p className="text-sm text-gray-700 mt-2"><strong>Adresse:</strong> {currentPending.adresse}</p>}
              {currentPending.kommune && <p className="text-sm text-gray-700"><strong>Kommune:</strong> {currentPending.kommune}</p>}
              {currentPending.balstorrelse && <p className="text-sm text-gray-700 mt-2"><strong>Bålstørrelse:</strong> {currentPending.balstorrelse}</p>}
              {currentPending.type && <p className="text-sm text-gray-700"><strong>Type:</strong> {currentPending.type}</p>}
              {currentPending.fra && <p className="text-sm text-gray-700"><strong>Fra:</strong> {currentPending.fra}</p>}
              {currentPending.til && <p className="text-sm text-gray-700"><strong>Til:</strong> {currentPending.til}</p>}
              {currentPending.beskrivelse && (
                <p className="text-sm text-gray-700 mt-2"><strong>Beskrivelse:</strong> {currentPending.beskrivelse}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Registrert: {new Date(currentPending.timestamp).toLocaleString('nb-NO')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                ✓ Godkjenn
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                ✗ Avslå
              </button>
            </div>

            {pendingInnmeldinger.length > 1 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                {pendingInnmeldinger.length - 1} flere venter...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
