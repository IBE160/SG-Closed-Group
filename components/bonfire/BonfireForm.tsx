'use client'

import { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'

const KOMMUNER_110_SORVEST = [
  'Velg kommune',
  // Rogaland (22 kommuner)
  'Stavanger',
  'Sandnes',
  'Sola',
  'Randaberg',
  'Strand',
  'Gjesdal',
  'Klepp',
  'Time',
  'Hå',
  'Eigersund',
  'Sokndal',
  'Lund',
  'Bjerkreim',
  'Hjelmeland',
  'Suldal',
  'Sauda',
  'Kvitsøy',
  'Bokn',
  'Tysvær',
  'Karmøy',
  'Haugesund',
  'Vindafjord',
  // Vestland (6 kommuner)
  'Bømlo',
  'Stord',
  'Fitjar',
  'Sveio',
  'Etne',
  // Agder (1 kommune)
  'Sirdal'
]

function BonfireFormContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [agreedToRules, setAgreedToRules] = useState(false)
  const [agreedToGDPR, setAgreedToGDPR] = useState(false)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const [addressValidationError, setAddressValidationError] = useState('')
  const [validatedCoordinates, setValidatedCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    municipality: '',
    burnDate: '',
    startTime: '',
    endTime: '',
    bonfire_diameter: 'LITE_1_5',
    bonfire_height: 'LITE_2',
    description: '',
    comments: ''
  })

  const validateAddress = async () => {
    if (!formData.address || !formData.postalCode) {
      setAddressValidationError('Vennligst fyll ut adresse og postnummer først.')
      return
    }

    setIsValidatingAddress(true)
    setAddressValidationError('')

    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: `${formData.address}, ${formData.postalCode}`
        })
      })

      const data = await response.json()

      if (data.success && data.verified) {
        setValidatedCoordinates({
          lat: data.verified.lat,
          lng: data.verified.lng
        })
        setAddressValidationError('')
        alert(`✓ Adressen er validert: ${data.verified.address}`)
      } else if (data.outsideRogaland) {
        setAddressValidationError(data.message || 'Adressen ligger utenfor Rogaland. Dette systemet er kun for bålmeldinger i Rogaland fylke.')
        setValidatedCoordinates(null)
      } else if (data.suggestions && data.suggestions.length > 0) {
        setAddressValidationError(`Fant ikke adressen. Forslag: ${data.suggestions.join(', ')}`)
      } else {
        setAddressValidationError(data.message || 'Kunne ikke validere adressen. Sjekk stavemåten.')
      }
    } catch (error) {
      console.error('Feil ved validering:', error)
      setAddressValidationError('Feil ved validering av adresse.')
    } finally {
      setIsValidatingAddress(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToRules) {
      alert('Du må bekrefte at du har lest og forstått reglene om utendørs brenning.')
      return
    }

    if (!agreedToGDPR) {
      alert('Du må godta personvernerklæringen.')
      return
    }

    if (!validatedCoordinates) {
      alert('Vennligst valider adressen før du sender inn skjemaet.')
      return
    }

    setIsSubmitting(true)

    try {
      let bonfireType = 'SMALL'
      if (formData.bonfire_diameter === 'MIDDELS_1_5_3' || formData.bonfire_height === 'MIDDELS_4') {
        bonfireType = 'MEDIUM'
      } else if (formData.bonfire_diameter === 'STORT_3' || formData.bonfire_height === 'STORT_4') {
        bonfireType = 'LARGE'
      }

      const response = await fetch('/api/bonfires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: `${formData.address}, ${formData.postalCode}`,
          municipality: formData.municipality,
          latitude: validatedCoordinates.lat,
          longitude: validatedCoordinates.lng,
          bonfireType: bonfireType,
          bonfireCategory: 'OTHER',
          dateFrom: `${formData.burnDate}T${formData.startTime}:00`,
          dateTo: `${formData.burnDate}T${formData.endTime}:00`,
          description: `${formData.description || ''} ${formData.comments ? '\nKommentarer: ' + formData.comments : ''}`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API feil:', errorData)
        throw new Error(errorData.details ? JSON.stringify(errorData.details) : 'Kunne ikke registrere bålmelding')
      }

      setSubmitSuccess(true)
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        postalCode: '',
        municipality: '',
        burnDate: '',
        startTime: '',
        endTime: '',
        bonfire_diameter: 'LITE_1_5',
        bonfire_height: 'LITE_2',
        description: '',
        comments: ''
      })
      setAgreedToRules(false)
      setAgreedToGDPR(false)
      setValidatedCoordinates(null)
      setAddressValidationError('')

      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setSubmitSuccess(false), 5000)

    } catch (error) {
      console.error('Feil:', error)
      alert('Noe gikk galt ved innsending av skjema!')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="font-semibold text-green-800">✓ Bålmeldingen er sendt!</p>
          <p className="text-sm text-green-700 mt-1">
            Du vil ikke få svar fra oss om vi har mottatt meldingen din. Meldingene vi får inn blir registrert, lagt
            inn i kartet vårt og slettet etter at brenningen har funnet sted.
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-6">GI BESKJED TIL BRANNVESENET</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Navn <span className="text-red-600">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Epost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Epost <span className="text-red-600">*</span>
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon (8 siffer) <span className="text-red-600">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="[0-9]{8}"
            placeholder="12345678"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse for bålbrenning <span className="text-red-600">*</span>
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Gateadresse"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Postnr/Sted */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postnr./sted <span className="text-red-600">*</span>
          </label>
          <input
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
            placeholder="4000 Stavanger"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Kommune */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kommune <span className="text-red-600">*</span>
          </label>
          <select
            name="municipality"
            value={formData.municipality}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="" disabled>Velg kommune</option>
            {KOMMUNER_110_SORVEST.filter(k => k !== 'Velg kommune').map((kommune) => (
              <option key={kommune} value={kommune}>
                {kommune}
              </option>
            ))}
          </select>
        </div>

        {/* Adressevalidering */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Valider adressen før du sender inn skjemaet
          </p>
          <button
            type="button"
            onClick={validateAddress}
            disabled={isValidatingAddress || !formData.address || !formData.postalCode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isValidatingAddress ? 'Validerer...' : validatedCoordinates ? '✓ Adresse validert' : 'Valider adresse'}
          </button>
          {addressValidationError && (
            <p className="text-sm text-red-600 mt-2">{addressValidationError}</p>
          )}
          {validatedCoordinates && !addressValidationError && (
            <p className="text-sm text-green-600 mt-2">✓ Adresse er validert og klar for innsending</p>
          )}
        </div>

        {/* Veibeskrivelse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Veibeskrivelse – enkleste vei til bålet
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Info box */}
        <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
          <p className="text-sm text-red-800">
            Det er ønskelig at bål og brenning meldes inn samme dag som brenningen skal foregå.
          </p>
        </div>

        {/* Dato for brenning */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dato for brenning <span className="text-red-600">*</span>
          </label>
          <input
            name="burnDate"
            type="date"
            value={formData.burnDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Klokkeslett start og slutt */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Klokkeslett start <span className="text-red-600">*</span>
            </label>
            <input
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Klokkeslett slutt <span className="text-red-600">*</span>
            </label>
            <input
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Diameter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bålets størrelse i diameter:
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="bonfire_diameter"
                value="LITE_1_5"
                checked={formData.bonfire_diameter === 'LITE_1_5'}
                onChange={handleChange}
                className="mr-1"
              />
              <span className="text-sm">Lite: inntil 1,5 meter</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="bonfire_diameter"
                value="MIDDELS_1_5_3"
                checked={formData.bonfire_diameter === 'MIDDELS_1_5_3'}
                onChange={handleChange}
                className="mr-1"
              />
              <span className="text-sm">Middels: 1,5 - 3 meter</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="bonfire_diameter"
                value="STORT_3"
                checked={formData.bonfire_diameter === 'STORT_3'}
                onChange={handleChange}
                className="mr-1"
              />
              <span className="text-sm">Stort: over 3 meter</span>
            </label>
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bålets størrelse i høyde:
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="bonfire_height"
                value="LITE_2"
                checked={formData.bonfire_height === 'LITE_2'}
                onChange={handleChange}
                className="mr-1"
              />
              <span className="text-sm">Lite: inntil 2 meter</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="bonfire_height"
                value="MIDDELS_4"
                checked={formData.bonfire_height === 'MIDDELS_4'}
                onChange={handleChange}
                className="mr-1"
              />
              <span className="text-sm">Middels: 4 meter</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="bonfire_height"
                value="STORT_4"
                checked={formData.bonfire_height === 'STORT_4'}
                onChange={handleChange}
                className="mr-1"
              />
              <span className="text-sm">Stort: over 4 meter</span>
            </label>
          </div>
        </div>

        {/* Safety Info */}
        <div className="bg-gray-50 border border-gray-300 p-4 rounded">
          <h3 className="font-bold text-base text-gray-800 mb-2">VED BÅLBRENNING:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Vis hensyn. Unngå at røyke fra bålet blir til sjenanse for naboer og nærmiljø.</li>
            <li>Bålet må ikke være større enn at du har kontroll på det og kan slokke ved behov.</li>
            <li>Ha egnede slokkemidler lett tilgjengelig. Ved sjø og vann kan bøtter benyttes.</li>
            <li>Hold alltid øye med bålet og sørg for at det er helt slokket før du forlater bålplassen.</li>
            <li>Det er forbudt å brenne plast, bygningsmaterialer og annet søppel.</li>
            <li>Brannvesenet anbefaler at store bål blir slokket ved morkets frembrudd. Dette for å unngå unødige utrykninger og telefoner inn til 110.</li>
          </ul>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kommentarer
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
          <p className="text-sm font-medium text-blue-900">
            Merk! Dette er kun en melding til 110 Sør-Vest. Hverken 110 Sør-Vest eller brannvesenet gir godkjenning til brenning.
          </p>
          <p className="text-sm text-blue-800 mt-1">
            Den som brenner har alt ansvar for at brenningen skjer på en forsvarlig måte i tråd med gjeldende regelverk.
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="mt-1 mr-2"
              required
            />
            <span className="text-sm text-gray-700">
              Jeg har lest og forstått{' '}
              <a href="#" className="text-blue-600 underline">
                reglene om utendørs brenning
              </a>
              <span className="text-red-600"> *</span>
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreedToGDPR}
              onChange={(e) => setAgreedToGDPR(e.target.checked)}
              className="mt-1 mr-2"
              required
            />
            <span className="text-sm text-gray-700">
              Jeg godtar at Rogaland brann og redning IKS lagrer mine personopplysninger for å kunne besvare mine forespørsler
              <span className="text-red-600"> *</span>
            </span>
          </label>
        </div>

        {/* Contact Info */}
        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
          <p>
            Spørsmål til skjemaet kan rettes til 110 Sør-Vest på epost:{' '}
            <a href="mailto:110@110sorvest.no" className="text-blue-600 underline">
              110@110sorvest.no
            </a>{' '}
            eller telefon:{' '}
            <a href="tel:51918520" className="text-blue-600 underline">
              51 91 85 20
            </a>
            .
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-700 hover:bg-red-800 text-white py-3 px-6 rounded font-semibold disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting ? 'SENDER...' : 'SEND'}
        </button>
      </form>
    </div>
  )
}

export default function BonfireForm() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} version="beta">
      <BonfireFormContent />
    </APIProvider>
  )
}
