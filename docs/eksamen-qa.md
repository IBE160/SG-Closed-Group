# Hva Skjer - Muntlig Eksamen Q&A

> **Prosjekt:** Hva Skjer - Nødmeldesystem for 110 Sør-Vest (Brannvesen)
> **Fag:** IBE160
> **Dato:** Desember 2025

---

## 1. Frontend og Teknologivalg

### Q: Hvilken frontend-teknologi brukte dere og hvorfor?

**Svar:**
Vi brukte **Next.js 14 med App Router** som frontend-rammeverk.

**Begrunnelse:**
- **Server-Side Rendering (SSR)**: Raskere initial lasting for operatører i 24/7-drift
- **App Router**: Moderne routing-arkitektur med server components
- **Vercel-optimalisering**: Sømløs deployment med edge functions for lav latens
- **TypeScript**: Typesikkerhet som reduserer feil i kritiske nødsystem
- **React 18**: Modern komponentbibliotek med god økosystem

**UI-biblioteker:**
- **Tailwind CSS**: Utility-first CSS for rask utvikling
- **shadcn/ui + Radix UI**: Tilgjengelige, profesjonelle komponenter
- **Lucide React**: Ikonbibliotek (450+ ikoner)

**Alternativ vurdert:** Vue.js/Nuxt, men Next.js hadde bedre integrasjon med Vercel og større økosystem.

---

### Q: Hvorfor valgte dere Zustand for state management?

**Svar:**
Vi valgte **Zustand** fremfor Redux eller Context API:

1. **Lettere (1KB)**: Minimal bundle-størrelse
2. **Bedre ytelse**: Selektive subscriptions unngår unødvendige re-renders
3. **Enklere API**: Ingen boilerplate som Redux krever
4. **Perfekt for vår skala**: Medium-størrelse app med 4-6 samtidige brukere

**Brukes til:**
- SSE-tilkoblingsstatus
- Flash-meldinger state
- Bilstatus (S111/S112)
- Event-liste
- Vaktplan og talegrupper

---

## 2. Backend og Database

### Q: Hvilken database brukte dere og hvorfor?

**Svar:**
Vi brukte **hybrid database-arkitektur** (ADR-006):

**PostgreSQL (Prisma ORM)** for:
- Brukere og autentisering
- Hendelser (Events)
- Flash-meldinger
- Bilstatus
- Vaktplan
- Talegrupper
- Audit logs

**Azure Table Storage** for:
- Bålmeldinger (BonfireRegistration)

**Begrunnelse for hybrid:**
1. Parallell utvikling - to studenter jobbet uavhengig
2. Azure Student subscription ga gratis Table Storage
3. Bålmelding-data er selvstendige med ingen foreign keys
4. Begge er GDPR-kompatible
5. Unngikk kompleks datamigrering under tidspress

---

### Q: Hvorfor valgte dere Prisma ORM?

**Svar:**
- **Type-sikre queries**: TypeScript-integrasjon fanger feil ved kompilering
- **Enkel migrering**: Automatiske database-migreringer
- **Utmerket Next.js integrasjon**: Prisma Client fungerer sømløst
- **Schema-first**: Deklarativ schema-definisjon
- **Query builder**: Intuitivt API for komplekse queries

---

## 3. Real-time Kommunikasjon

### Q: Hvordan implementerte dere sanntidsoppdateringer?

**Svar:**
Vi brukte **Server-Sent Events (SSE)** fremfor WebSockets.

**Arkitektur:**
```
API Route Handler →
Database Update (Prisma) →
SSE Broadcast →
Alle tilkoblede dispatchere (< 1 sekund)
```

**Begrunnelse for SSE:**
1. **Enveiskommunikasjon**: Perfekt for broadcast til klienter
2. **Gratis**: Ingen ekstern tjeneste nødvendig
3. **Native browser-støtte**: Automatisk reconnection
4. **Vercel-kompatibel**: Fungerer med serverless functions
5. **Enklere implementasjon**: Mindre kompleks enn WebSockets

**SSE Event-typer:**
- `event_created/updated/deleted`
- `bilstatus_update`
- `vaktplan_update`
- `talegruppe_*`
- `flash_message`
- `heartbeat` (keep-alive)

---

### Q: Hvordan løste dere ytelsesproblemet med UI-blinking?

**Svar:**
**Problemet:** 5 separate SSE-tilkoblinger forårsaket race conditions og UI-blinking.

**Løsning:** Sentralisert SSE-arkitektur:
1. **Én SSE-tilkobling** i SSEProvider (ikke 5 separate)
2. **Sentraliserte Zustand stores** for state management
3. **React.memo()** optimalisering på alle komponenter
4. **Ingen duplisert polling**

**Resultat:** Ingen blinking, stabil UI-oppdatering.

---

## 4. Autentisering og Sikkerhet

### Q: Hvordan håndterte dere autentisering?

**Svar:**
Vi brukte **NextAuth.js v5 (Auth.js)** med **Google OAuth 2.0**.

**Arkitektur:**
1. Bruker klikker "Logg inn med Google"
2. Google OAuth consent screen
3. NextAuth mottar token
4. Sjekker e-post mot whitelist (Prisma)
5. Oppretter JWT session (16 timer)
6. Redirect til /hva-skjer dashboard

**Sikkerhetstiltak:**
- **Whitelist-basert tilgang**: Kun forhåndsgodkjente e-poster
- **JWT sessions**: Stateless, serverless-vennlig
- **RBAC**: To roller (OPERATOR, ADMINISTRATOR)
- **CSRF-beskyttelse**: SameSite cookies
- **XSS-beskyttelse**: React + Content Security Policy

**Hvorfor Google OAuth:**
- Unngikk IT-avdeling godkjenning (Microsoft EntraID)
- Rask implementasjon
- Ingen passordlagring

---

## 5. BMAD-prosessen

### Q: Hvilke BMAD-dokumenter har dere?

**Svar:**
Vi har følgende dokumenter:

| Dokument | Status | Fil |
|----------|--------|-----|
| Product Brief | ✅ Komplett | `product-brief-hva-skjer-2025-11-10.md` |
| PRD | ✅ Komplett | `PRD.md` (1146 linjer) |
| Architecture | ✅ Komplett | `architecture.md` (2350 linjer) |
| Epics | ✅ Komplett | `epics.md` (5 epics, 35 stories) |
| Tech Specs | ✅ Komplett | `tech-spec-epic-2/3/4.md` |
| Stories | ✅ Komplett | 20+ story-filer i `docs/stories/` |
| Sprint Status | ✅ Komplett | `sprint-status.yaml` |
| UX Design | ✅ Komplett | `ux-design-specification.md` |
| Retrospective | ✅ 1 gjennomført | `epic-5-retro-2025-11-27.md` |

---

### Q: Hvilke BMAD-dokumenter mangler og hvorfor?

**Svar:**
**Manglende/utelatte dokumenter:**

1. **Research dokument**
   - *Hvorfor:* Begrenset tid, gikk direkte til Product Brief basert på domenekunskap

2. **Flere retrospectives**
   - *Hvorfor:* Kun Epic 5 retro gjennomført, andre markert som "optional"
   - *Begrunnelse:* Tidspress og fokus på implementasjon

3. **Test-dokumentasjon**
   - *Hvorfor:* Prioriterte fungerende kode over test-dokumenter
   - *Konsekvens:* Mindre formell testdekning

4. **Deployment/Operations guide**
   - *Hvorfor:* Vercel håndterer dette automatisk
   - *Kunne vært:* Miljøvariabler og konfigurasjon dokumentert

**Refleksjon:**
- BMAD-prosessen var nyttig for struktur
- Noen dokumenter var "overkill" for prosjektstørrelsen
- Burde hatt flere retrospectives for læring

---

### Q: Hvilken prosess i BMAD var vanskeligst?

**Svar:**
**Vanskeligste prosesser:**

1. **Architecture-beslutninger**
   - Mange teknologivalg med langsiktige konsekvenser
   - SSE vs WebSocket-diskusjonen
   - Hybrid database-arkitektur (ADR-006)

2. **Epic/Story breakdown**
   - Riktig størrelse på stories (200k context limit)
   - Avhengigheter mellom stories
   - Sekvensering for inkrementell verdi

3. **Tech Spec for Epic 5 (Bålmelding)**
   - Azure OpenAI integrasjon
   - Google Maps API kompleksitet
   - Power Automate vs direkte API

**Lærdommer:**
- Start med minimum viable dokumentasjon
- Iterer på dokumenter parallelt med kode
- Ikke overplanlegg - noen beslutninger må tas underveis

---

## 6. Tekniske Utfordringer

### Q: Hva var de største tekniske utfordringene?

**Svar:**

1. **SSE på Vercel (Serverless)**
   - *Problem:* 10-sekunders timeout på serverless functions
   - *Løsning:* Edge functions + polling fallback

2. **AI SDK v5 migrering**
   - *Problem:* Breaking changes fra v4 til v5
   - *Løsning:* Refaktorering til `tool()` helper og `generateText`

3. **Merge-konflikter med parallell utvikling**
   - *Problem:* To utviklere, forskjellige brancher
   - *Løsning:* Sentralisert SSE-arkitektur, Zustand stores

4. **Google Maps API**
   - *Problem:* Geocoding, Places Autocomplete, marker clustering
   - *Løsning:* `@vis.gl/react-google-maps` bibliotek

5. **GDPR-compliance**
   - *Problem:* Persondata (navn, telefon, adresser)
   - *Løsning:* 90 dagers retensjon, automatisk sletting

---

## 7. Prosjektorganisering

### Q: Hvordan organiserte dere arbeidet?

**Svar:**

**Verktøy:**
- **Git/GitHub**: Versjonskontroll og pull requests
- **GitHub Issues**: Oppgavesporing
- **Sprint Status YAML**: Oppgavestatus tracking

**Arbeidsflyt:**
1. Epic tech context → Story drafting → Implementation → Code review → Done
2. Parallell utvikling med klareklbrancher
3. PR-basert merge til main

**Roller:**
- Begge utviklere jobbet fullstack
- Epic 5 (Bålmelding) delvis separat utviklet
- Integrasjon via ADR-006 hybrid-arkitektur

---

## 8. Arkitekturbeslutninger (ADRs)

### Q: Hva er ADRs og hvilke tok dere?

**Svar:**
**ADR = Architecture Decision Record** - dokumenterer viktige tekniske valg.

**Våre ADRs:**

| ADR | Beslutning | Begrunnelse |
|-----|------------|-------------|
| ADR-001 | SSE over WebSockets | Enveiskommunikasjon, gratis, native browser |
| ADR-002 | Always-visible Flash Bar | Ingen tab-switching, kan ikke misses |
| ADR-003 | Zustand over Context API | Bedre ytelse, enklere API |
| ADR-004 | Parallel AI Automation | Dual-path med duplicate detection |
| ADR-005 | Bonfire Status Lifecycle | 4 statuser med fargeikoner |
| ADR-006 | Hybrid Database | PostgreSQL + Azure Table Storage |

---

## 9. Fremtidige Forbedringer

### Q: Hva ville dere gjort annerledes / forbedret?

**Svar:**

**Ville gjort annerledes:**
1. Mer testing fra start (unit tests, e2e)
2. Bedre dokumentasjon av API-endepunkter
3. Flere retrospectives underveis
4. Tydeligere komponentbibliotek-struktur

**Fremtidige forbedringer:**
1. **Mobil app** for felt-enheter
2. **Integration med Locus** (primær nødsystem) hvis API tilgjengelig
3. **Analytics dashboard** for flash-meldinger og bålmeldinger
4. **SMS-varsling** til borgere etter bålregistrering
5. **Historisk rapportering** for compliance

---

## 10. Nøkkeltall og Fakta

| Kategori | Verdi |
|----------|-------|
| **Kodelinjer** | ~15,000+ |
| **Epics** | 5 |
| **Stories** | 35 |
| **API-endepunkter** | 20+ |
| **Database-tabeller** | 10+ |
| **Kommuner (bålmelding)** | 29 |
| **Samtidige brukere** | 4-6 dispatchere |
| **SSE latens** | < 1 sekund |
| **Session-varighet** | 16 timer |
| **Bålmelding retensjon** | 90 dager |

---

## 11. Demonstrasjon / Live Demo Tips

**Vis disse funksjonene:**
1. **Flash-melding**: Ctrl+Shift+F → skriv melding → se broadcast
2. **Bilstatus toggle**: Klikk S111/S112, se real-time sync
3. **Hendelse opprettelse**: Lag Pri 1 hendelse, se rød markering
4. **Bålmelding kart**: Vis Google Maps med POI-markører
5. **AI chatbot**: Demonstrer e-post parsing
6. **Audit log**: Vis sporbarhet i Innstillinger

---

## 12. Refleksjon over Læring

### Q: Hva lærte dere mest av prosjektet?

**Svar:**

1. **Real-time systemer er komplekse**
   - SSE/WebSocket valg har store konsekvenser
   - State synchronization på tvers av klienter

2. **AI-integrasjon krever iterasjon**
   - Prompt engineering tar tid
   - API-versjoner endres raskt (AI SDK v4→v5)

3. **BMAD gir struktur, men fleksibilitet trengs**
   - Ikke alle dokumenter er like verdifulle
   - Iterer på dokumentasjon

4. **Parallell utvikling krever god planlegging**
   - Klare grensesnitt mellom komponenter
   - Merge-konflikter er uunngåelige

5. **Nødsystemer har unike krav**
   - < 1 sekund latens er kritisk
   - 24/7 drift betyr høy pålitelighet

---

*Lykke til med eksamen!*
