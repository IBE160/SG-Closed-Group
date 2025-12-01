# Epic 5 Vol.2: Bålmelding System Improvements

**Date:** 2025-11-27
**Branch:** #Epic-5-vol.2
**Status:** In Progress

---

## Overview

Epic 5 Vol.2 fokuserer på forbedringer og bugfixes til det eksisterende bålmeldingssystemet. Dette inkluderer:
- Forbedret adressevalidering med Google Places API
- Auto-fokus på chat-input for bedre UX
- AI SDK v5 oppdateringer og refaktorering

---

## Stories

### Story 5.2.1: Google Places API Integration for Landmark Recognition

**Status:** Done

**Beskrivelse:**
AI-chatten brukte feil adresse når brukere oppga landemerker som "domkirke stavanger". Adressen som ble lagret var brukerens opprinnelige tekst i stedet for den validerte adressen fra Google Maps.

**Løsning:**
- Lagt til Google Places API (`findPlaceFromText`) for bedre stedsgjenkjenning
- Implementert reverse geocoding for nøyaktig kommune-identifikasjon
- Oppdatert system-prompt til å tvinge AI til å bruke validerte adresser
- Importert `PlaceInputType` enum for TypeScript-kompatibilitet

**Tekniske endringer:**
```typescript
// Ny import
import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js'

// Places API kall
const placesResult = await mapsClient.findPlaceFromText({
  params: {
    input: address + ' Norge',
    inputtype: PlaceInputType.textQuery,
    fields: ['formatted_address', 'geometry', 'name', 'place_id'],
    locationbias: 'circle:50000@58.97,5.73', // Bias mot Stavanger-området
    key: apiKey
  }
})
```

**Filer endret:**
- `app/api/chat/bonfire/route.ts`

---

### Story 5.2.2: AI Chat Input Auto-Focus

**Status:** Done

**Beskrivelse:**
Brukere måtte klikke på input-feltet hver gang de ville skrive en melding i AI-chatten. Dette var en dårlig brukeropplevelse.

**Løsning:**
- Lagt til `inputRef` for input-elementet
- Implementert `useEffect` for auto-fokus når chatten åpnes
- Implementert `useEffect` for auto-fokus etter at AI har svart

**Tekniske endringer:**
```typescript
const inputRef = useRef<HTMLInputElement>(null)

// Auto-fokus når chatten åpnes
useEffect(() => {
  if (isOpen && inputRef.current) {
    inputRef.current.focus()
  }
}, [isOpen])

// Auto-fokus etter at AI har svart
useEffect(() => {
  if (!isLoading && isOpen && inputRef.current) {
    inputRef.current.focus()
  }
}, [isLoading, isOpen])
```

**Filer endret:**
- `components/bonfire/AIChat.tsx`

---

### Story 5.2.3: AI SDK v5 Tool Refactoring

**Status:** Done

**Beskrivelse:**
Refaktorering av verktøydefinisjoner for AI SDK v5 kompatibilitet.

**Løsning:**
- Migrert fra inline tool-definisjoner til `tool()` helper
- Byttet fra `streamText` til `generateText` for enklere håndtering
- Implementert `stopWhen: stepCountIs(5)` for multi-step tool execution

**Tekniske endringer:**
```typescript
import { generateText, stepCountIs, tool } from 'ai'

const validateAddressTool = tool({
  description: '...',
  inputSchema: z.object({...}),
  execute: async ({ address }) => {...}
})

const result = await generateText({
  model,
  system: SYSTEM_PROMPT,
  messages,
  tools: {
    validateAddress: validateAddressTool,
    validatePhoneNumber: validatePhoneNumberTool,
    saveBonfireNotification: saveBonfireNotificationTool,
  },
  stopWhen: stepCountIs(5),
})
```

**Filer endret:**
- `app/api/chat/bonfire/route.ts`

---

## Commits

| Commit | Beskrivelse |
|--------|-------------|
| `468307d` | Improve AI chat: Places API for landmarks + auto-focus input |

---

## Testing

### Adressevalidering
- [x] "domkirken i stavanger" → Finner "Stavanger domkirke, Haakon VIIs gate 2, 4005 Stavanger"
- [x] "hinna sentrum" → Finner korrekt adresse med Stavanger kommune
- [x] Adresser utenfor området (Oslo) → Viser feilmelding

### Auto-fokus
- [x] Åpne chat → Input fokusert automatisk
- [x] Send melding → Vent på svar → Input fokusert automatisk
- [x] Kan skrive umiddelbart uten å klikke

---

### Story 5.2.4: Map Search with Google Places Autocomplete

**Status:** Done

**Beskrivelse:**
Brukere trengte en måte å søke etter steder på kartet, likt som i Google Maps. Uten søkefunksjon måtte de manuelt navigere rundt på kartet for å finne områder.

**Løsning:**
- Lagt til `MapSearchBox` komponent med Google Places Autocomplete
- Søkefeltet vises øverst til venstre på kartet
- Autocomplete foreslår steder mens brukeren skriver
- Klikk på forslag panorerer kartet til stedet og zoomer inn
- Begrenset til Norge (`componentRestrictions: { country: 'no' }`)
- Støtter både adresser og steder/virksomheter

**Tekniske endringer:**
```typescript
import { useMapsLibrary } from '@vis.gl/react-google-maps'

function MapSearchBox() {
  const map = useMap()
  const placesLib = useMapsLibrary('places')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!placesLib || !inputRef.current) return

    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'no' },
      fields: ['geometry', 'name', 'formatted_address'],
      types: ['geocode', 'establishment']
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry?.location && map) {
        map.panTo(place.geometry.location)
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport)
        } else {
          map.setZoom(15)
        }
      }
    })
  }, [placesLib, map])
}
```

**Filer endret:**
- `components/bonfire/BonfireMap.tsx`

---

## Commits

| Commit | Beskrivelse |
|--------|-------------|
| `468307d` | Improve AI chat: Places API for landmarks + auto-focus input |
| `54ca81b` | Add JSDoc comments to bonfire chat components |
| `696aeb4` | Add Epic 5 retrospective document |

---

## Testing

### Adressevalidering
- [x] "domkirken i stavanger" → Finner "Stavanger domkirke, Haakon VIIs gate 2, 4005 Stavanger"
- [x] "hinna sentrum" → Finner korrekt adresse med Stavanger kommune
- [x] Adresser utenfor området (Oslo) → Viser feilmelding

### Auto-fokus
- [x] Åpne chat → Input fokusert automatisk
- [x] Send melding → Vent på svar → Input fokusert automatisk
- [x] Kan skrive umiddelbart uten å klikke

### Kartsøk
- [ ] Søk etter "Stavanger domkirke" → Kartet panorerer til domkirken
- [ ] Søk etter "Haugesund" → Kartet panorerer til Haugesund by
- [ ] Autocomplete viser forslag mens man skriver
- [ ] Tøm-knapp fjerner søketeksten

---

## Neste steg

- [ ] Vurdere streaming av AI-responser for bedre UX
- [ ] Legge til validering av e-postadresse i chat
- [ ] Forbedre feilhåndtering ved nettverksproblemer
