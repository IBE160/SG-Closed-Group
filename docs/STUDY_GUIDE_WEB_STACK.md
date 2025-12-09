# Studieveiledning: Web-Stack Teknologier

**Forberedelse til muntlig eksamen - IBE160**

---

## Oversikt: Hva er en Web-Stack?

En **web-stack** er samlingen av teknologier som brukes for å bygge en nettapplikasjon. Tenk på det som lagene i en kake:

```
┌─────────────────────────────────────┐
│           BRUKER (Nettleser)        │
├─────────────────────────────────────┤
│           FRONTEND                  │  ← Det brukeren ser
├─────────────────────────────────────┤
│           BACKEND                   │  ← Logikken bak kulissene
├─────────────────────────────────────┤
│           DATABASE                  │  ← Der data lagres
└─────────────────────────────────────┘
```

---

## 1. FRONTEND (Klientsiden)

### Hva er det?
Frontend er **alt brukeren ser og interagerer med** i nettleseren. Det er brukergrensesnittet (UI) - knapper, tekst, bilder, skjemaer og animasjoner.

### Hvorfor brukes det?
- Gir brukeren en visuell måte å bruke applikasjonen på
- Gjør applikasjonen brukervennlig og tilgjengelig
- Håndterer brukerinteraksjon (klikk, skriving, navigasjon)

### Teknologier i dette prosjektet:

| Teknologi | Hva det er | Hvorfor vi bruker det |
|-----------|-----------|----------------------|
| **React** | JavaScript-bibliotek for å bygge brukergrensesnitt | Lar oss lage gjenbrukbare komponenter (f.eks. en knapp som kan brukes mange steder) |
| **Next.js** | Rammeverk bygget på React | Gir oss routing, server-rendering og enkel oppsett |
| **TypeScript** | JavaScript med typer | Fanger feil før koden kjøres, gjør koden mer pålitelig |
| **Tailwind CSS** | CSS-rammeverk | Rask styling direkte i HTML med ferdiglagde klasser |
| **shadcn/ui** | Ferdiglagde UI-komponenter | Profesjonelle knapper, dialoger, skjemaer uten å lage alt fra scratch |

### Enkelt forklart:
> **React** er som LEGO-klosser - du bygger små deler (komponenter) som du setter sammen til en helhet. **Next.js** er oppskriften som forteller hvordan klossene skal settes sammen. **Tailwind** er malingen som gjør det pent.

---

## 2. BACKEND (Serversiden)

### Hva er det?
Backend er **logikken som kjører på serveren**. Det er den "usynlige" delen som behandler forespørsler, snakker med databasen, og sørger for sikkerhet.

### Hvorfor brukes det?
- Håndterer forretningslogikk (regler for hva som skal skje)
- Kommuniserer trygt med databasen
- Beskytter sensitiv data (passord, API-nøkler)
- Validerer at data er korrekt før lagring

### Teknologier i dette prosjektet:

| Teknologi | Hva det er | Hvorfor vi bruker det |
|-----------|-----------|----------------------|
| **Next.js API Routes** | Serverløse funksjoner | Lar oss skrive backend-kode i samme prosjekt som frontend |
| **Node.js** | JavaScript-runtime | Kjører JavaScript på serveren (ikke bare i nettleseren) |
| **Prisma** | ORM (Object-Relational Mapping) | Snakker med databasen på en enkel måte med TypeScript |
| **NextAuth.js** | Autentisering | Håndterer innlogging, utlogging og brukersesjoner |

### Enkelt forklart:
> **Backend** er som kjøkkenet på en restaurant. Gjesten (frontend) bestiller mat, kjøkkenet (backend) lager maten og henter ingredienser fra kjøleskapet (database), og serverer ferdig mat tilbake.

### API - Kommunikasjon mellom frontend og backend

**API** (Application Programming Interface) er hvordan frontend og backend snakker sammen.

```
Frontend                    Backend                    Database
   │                           │                          │
   │  "Hent alle hendelser"    │                          │
   │ ─────────────────────────>│  "SELECT * FROM Event"   │
   │                           │ ─────────────────────────>│
   │                           │                          │
   │                           │  [liste med hendelser]   │
   │   {data: [...]}           │ <─────────────────────────│
   │ <─────────────────────────│                          │
```

**HTTP-metoder:**
- `GET` - Hent data (les)
- `POST` - Opprett ny data
- `PUT/PATCH` - Oppdater eksisterende data
- `DELETE` - Slett data

---

## 3. DATABASE

### Hva er det?
En database er **organisert lagring av data**. Tenk på det som et digitalt arkivskap med mapper og dokumenter.

### Hvorfor brukes det?
- Data overlever selv om serveren starter på nytt
- Flere brukere kan jobbe med samme data samtidig
- Rask søking og filtrering av store datamengder
- Sikkerhet og backup av viktig informasjon

### Teknologier i dette prosjektet:

| Teknologi | Hva det er | Hvorfor vi bruker det |
|-----------|-----------|----------------------|
| **PostgreSQL** | Relasjonsdatabase | Pålitelig, kraftig og gratis database for strukturerte data |
| **Supabase** | Database-hosting (BaaS) | Gratis hosting av PostgreSQL med dashboard, backups og SSL |
| **Prisma** | ORM | Oversetter mellom TypeScript-objekter og SQL-spørringer |

### Supabase - Hva er det?

**Supabase** er en "Backend-as-a-Service" (BaaS) plattform som gir deg en ferdig PostgreSQL-database i skyen.

**Hvorfor bruker vi Supabase?**
- **Gratis tier** - Perfekt for studentprosjekter
- **Ferdig oppsett** - Ingen server å konfigurere selv
- **Dashboard** - Visuelt grensesnitt for å se og redigere data
- **Automatisk backup** - Data er sikret
- **Connection pooling** - Håndterer mange samtidige tilkoblinger effektivt

**Hvordan fungerer det?**
```
Vår Next.js App  ──────>  Supabase (i skyen)  ──────>  PostgreSQL Database
                  via Prisma ORM                         (hostet av Supabase)
```

**To typer tilkoblinger:**
| Type | Port | Bruksområde |
|------|------|-------------|
| **Pooled (pgbouncer)** | 6543 | Vanlige spørringer - deler tilkoblinger effektivt |
| **Direct** | 5432 | Database-migrasjoner - krever direkte tilkobling |

### Relasjonsdatabase forklart:

Data lagres i **tabeller** med **rader** og **kolonner**:

```
TABELL: User
┌────┬─────────────────────┬───────────────┐
│ id │ email               │ role          │
├────┼─────────────────────┼───────────────┤
│ 1  │ ola@test.no         │ OPERATOR      │
│ 2  │ kari@test.no        │ ADMINISTRATOR │
└────┴─────────────────────┴───────────────┘

TABELL: Event
┌────┬────────────────────┬──────────┬─────────┐
│ id │ title              │ priority │ userId  │
├────┼────────────────────┼──────────┼─────────┤
│ 1  │ Skogbrann Ås       │ CRITICAL │ 1       │
│ 2  │ Bålarrangement     │ NORMAL   │ 2       │
└────┴────────────────────┴──────────┴─────────┘
```

**Relasjoner** kobler tabeller sammen (userId i Event peker til id i User).

### Enkelt forklart:
> **Database** er som et Excel-regneark på steroider. Den kan håndtere millioner av rader, flere brukere samtidig, og garanterer at data ikke går tapt.

---

## 4. AUTENTISERING OG AUTORISASJON

### Hva er forskjellen?

| Konsept | Spørsmål | Eksempel |
|---------|----------|----------|
| **Autentisering** | "Hvem er du?" | Innlogging med brukernavn/passord |
| **Autorisasjon** | "Hva har du lov til?" | Bare administratorer kan slette brukere |

### Teknologier i dette prosjektet:

| Teknologi | Hva det er | Hvorfor vi bruker det |
|-----------|-----------|----------------------|
| **NextAuth.js** | Autentiseringsbibliotek | Håndterer hele innloggingsflyten for oss |
| **Google OAuth** | Tredjepartsinnlogging | "Logg inn med Google" - enklere for brukeren |
| **JWT (JSON Web Token)** | Sesjonstoken | Beviser at brukeren er innlogget uten å spørre databasen hver gang |

### OAuth-flyt forklart:

```
1. Bruker klikker "Logg inn med Google"
2. Brukeren sendes til Google
3. Google spør: "Vil du gi tilgang?"
4. Bruker sier ja
5. Google sender bruker tilbake med en kode
6. Vår server bytter koden mot brukerinfo
7. Bruker er innlogget!
```

---

## 5. STATE MANAGEMENT (Tilstandshåndtering)

### Hva er det?
**State** er data som kan endre seg over tid i applikasjonen. For eksempel:
- Er brukeren innlogget?
- Hvilke hendelser vises på skjermen?
- Er en modal åpen eller lukket?

### Hvorfor trenger vi det?
- Synkronisere data mellom komponenter
- Huske brukerens valg
- Oppdatere UI automatisk når data endres

### Teknologier i dette prosjektet:

| Teknologi | Hva det er | Når vi bruker det |
|-----------|-----------|-------------------|
| **React useState** | Lokal state | Enkel state i én komponent |
| **React Context** | Delt state | State som trengs av mange komponenter |
| **Zustand** | Global state manager | Kompleks state som hendelser, bilstatus |
| **React Query** | Server state | Data fra API-er med caching og oppdatering |

### Enkelt forklart:
> **State** er som hukommelsen til applikasjonen. Uten det ville appen glemme alt hver gang du klikker på noe.

---

## 6. REAL-TIME (Sanntid)

### Hva er det?
Real-time betyr at data oppdateres **automatisk** uten at brukeren må trykke refresh.

### Hvorfor brukes det?
- Operatører ser nye hendelser umiddelbart
- Bilstatus oppdateres når kjøretøy beveger seg
- Flash-meldinger vises med en gang

### Teknologier i dette prosjektet:

| Teknologi | Hva det er | Hvorfor vi bruker det |
|-----------|-----------|----------------------|
| **Server-Sent Events (SSE)** | Enveis datastrøm fra server | Serveren kan "pushe" oppdateringer til klienten |
| **Polling (fallback)** | Regelmessig sjekking | Backup hvis SSE ikke fungerer |

### Forskjellen på HTTP vs SSE:

```
Vanlig HTTP (request-response):
Klient: "Har det skjedd noe nytt?"
Server: "Nei"
(5 sek senere)
Klient: "Har det skjedd noe nytt?"
Server: "Ja, ny hendelse!"

SSE (server-push):
Server: *venter*
Server: "Ny hendelse!" (når det skjer)
Server: "Ny flash-melding!" (når det skjer)
```

---

## 7. AI-INTEGRASJON

### Hva er det?
Kunstig intelligens (AI) integrert i applikasjonen for å hjelpe brukere.

### Hvorfor brukes det?
- Chatbot for bålregistrering (forenkler prosessen)
- Automatisk validering av inndata
- Smartere brukeropplevelse

### Teknologier i dette prosjektet:

| Teknologi | Hva det er | Hvorfor vi bruker det |
|-----------|-----------|----------------------|
| **Vercel AI SDK** | Rammeverk for AI-integrasjon | Enkel måte å koble til ulike AI-leverandører |
| **Azure OpenAI (GPT-4o)** | AI-modell | Kraftig språkmodell for chatbot |
| **Anthropic Claude** | Alternativ AI-modell | Backup AI-leverandør |

---

## 8. DEPLOYMENT (Utrulling)

### Hva er det?
**Deployment** er prosessen med å gjøre applikasjonen tilgjengelig for brukere på internett.

### Hvorfor er det viktig?
- Uten deployment kan bare utviklere bruke applikasjonen
- Produksjonsmiljøet må være stabilt og sikkert
- Brukere forventer at applikasjonen alltid er tilgjengelig

### Teknologier i dette prosjektet:

| Teknologi | Hva det er | Hvorfor vi bruker det |
|-----------|-----------|----------------------|
| **Vercel** | Hosting-plattform | Optimalisert for Next.js, automatisk deployment |
| **Git** | Versjonskontroll | Sporer alle endringer i koden |
| **CI/CD** | Continuous Integration/Deployment | Automatisk testing og deployment ved kodeendringer |

### Deployment-flyt:

```
1. Utvikler pusher kode til Git
2. Vercel oppdager endringen
3. Koden bygges automatisk
4. Tester kjøres
5. Ny versjon går live
```

---

## 9. SIKKERHET

### Viktige sikkerhetskonsepter:

| Konsept | Hva det er | Hvordan vi håndterer det |
|---------|-----------|-------------------------|
| **HTTPS** | Kryptert kommunikasjon | All trafikk er kryptert (Vercel håndterer dette) |
| **Input-validering** | Sjekke brukerinput | Zod-validering på både frontend og backend |
| **SQL-injection** | Angrep via database-spørringer | Prisma beskytter oss automatisk |
| **XSS** | Angrep via ondsinnet JavaScript | React escaper automatisk |
| **CSRF** | Angrep som utnytter brukersesjoner | Tokens og headers beskytter mot dette |

---

## 10. OPPSUMMERING - FULL STACK FLYT

Slik henger alt sammen når en bruker oppretter en ny hendelse:

```
1. BRUKER
   Fyller ut skjema på websiden
              │
              ▼
2. FRONTEND (React/Next.js)
   - Validerer input med Zod
   - Sender POST-request til API
              │
              ▼
3. BACKEND (Next.js API Route)
   - Verifiserer at bruker er innlogget (NextAuth)
   - Sjekker at bruker har rettigheter (autorisasjon)
   - Validerer data på nytt
   - Lagrer i database via Prisma
              │
              ▼
4. DATABASE (PostgreSQL)
   - Lagrer hendelsen
   - Returnerer den nye hendelsen
              │
              ▼
5. BACKEND
   - Sender SSE-event til alle tilkoblede klienter
   - Returnerer suksess-respons
              │
              ▼
6. FRONTEND
   - Oppdaterer Zustand-store med ny hendelse
   - React re-renderer UI
              │
              ▼
7. BRUKER
   Ser den nye hendelsen i listen!
```

---

## Teknologi-stack sammendrag

| Lag | Teknologi | Formål |
|-----|-----------|--------|
| **Frontend** | Next.js, React, TypeScript | Brukergrensesnitt |
| **Styling** | Tailwind CSS, shadcn/ui | Utseende |
| **Backend** | Next.js API Routes | Server-logikk |
| **Database** | PostgreSQL + Prisma | Datalagring |
| **DB Hosting** | Supabase | Database i skyen (BaaS) |
| **Auth** | NextAuth.js + Google OAuth | Innlogging |
| **State** | Zustand + React Query | Tilstandshåndtering |
| **Real-time** | SSE | Sanntidsoppdateringer |
| **AI** | Vercel AI SDK + Azure OpenAI | Chatbot |
| **Hosting** | Vercel | Deployment |

---

## Tips til muntlig eksamen

1. **Forklar med egne ord** - Ikke bare ramse opp teknologinavn
2. **Bruk analogier** - "Backend er som kjøkkenet på en restaurant"
3. **Forstå sammenhengen** - Hvordan lagene kommuniserer
4. **Kunne forklare valg** - Hvorfor Next.js fremfor bare React?
5. **Kjenn begrensninger** - Hva er ulempene med valgene?

### Mulige spørsmål:

1. "Hva er forskjellen på frontend og backend?"
2. "Hvorfor bruker dere TypeScript i stedet for JavaScript?"
3. "Forklar hvordan en bruker logger inn i systemet"
4. "Hva er en API, og hvordan fungerer den?"
5. "Hvorfor trenger dere en database?"
6. "Hva betyr real-time i denne sammenhengen?"
7. "Hvordan håndterer dere sikkerhet?"

---

*Dokumentet er oppdatert for SG-Closed-Group prosjektet - IBE160*
