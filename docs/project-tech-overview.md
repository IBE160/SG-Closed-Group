# Hva Skjer - Teknisk Arkitektur Oversikt

> **Prosjekt**: Hva Skjer - Nødmeldesystem for 110 Sør-Vest (Brannvesen)
> **Versjon**: 0.1.0
> **Dato**: 2025-11-29

---

## Formål

Dette dokumentet beskriver den komplette teknologistakken for "Hva Skjer" - et sanntids nødmeldesystem for brannvesenet i Sør-Vest Norge. Systemet håndterer operatørdashboard, kjøretøystatus, vaktplaner, bålmeldinger og mer.

---

## Arkitektur Diagram (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              BRUKERGRENSESNITT                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Next.js 14 (App Router)                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│ │
│  │  │  React 18   │ │ TypeScript  │ │ Tailwind CSS│ │ shadcn/ui + Radix UI││ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                          STATE MANAGEMENT                              │  │
│  │  ┌────────────┐  ┌────────────────────┐  ┌──────────────────────────┐  │  │
│  │  │   Zustand  │  │ TanStack Query     │  │ React Hook Form + Zod    │  │  │
│  │  │ (lokal)    │  │ (server state)     │  │ (skjema validering)      │  │  │
│  │  └────────────┘  └────────────────────┘  └──────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP / SSE
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                 API LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        Next.js API Routes (REST)                        │ │
│  │  /api/events   /api/bilstatus   /api/vaktplan   /api/talegrupper       │ │
│  │  /api/bonfires /api/chat/*      /api/sse        /api/admin/*           │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌──────────────────────┐      ┌──────────────────────────────────────────┐  │
│  │   AUTENTISERING      │      │           REAL-TIME                     │  │
│  │  ┌────────────────┐  │      │  ┌──────────────────────────────────┐   │  │
│  │  │ NextAuth.js v5 │  │      │  │ Server-Sent Events (SSE)         │   │  │
│  │  │ + Google OAuth │  │      │  │ - Hendelser                      │   │  │
│  │  │ + JWT Sessions │  │      │  │ - Bilstatus                      │   │  │
│  │  │ + RBAC         │  │      │  │ - Vaktplan                       │   │  │
│  │  └────────────────┘  │      │  │ - Bålmeldinger                   │   │  │
│  └──────────────────────┘      │  └──────────────────────────────────┘   │  │
│                                └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             DATABASELAG                                      │
│  ┌───────────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │         POSTGRESQL (Vercel)           │  │    Azure Table Storage      │  │
│  │  ┌─────────────────────────────────┐  │  │  ┌───────────────────────┐  │  │
│  │  │         Prisma ORM              │  │  │  │ Bålmeldingsarkiv      │  │  │
│  │  │  • User, Session                │  │  │  │ (e-post backup)       │  │  │
│  │  │  • Event, FlashMessage          │  │  │  └───────────────────────┘  │  │
│  │  │  • VehicleStatus, DutyRoster    │  │  └─────────────────────────────┘  │
│  │  │  • Talegruppe, BonfireReg       │  │                                   │
│  │  │  • AuditLog                     │  │                                   │
│  │  └─────────────────────────────────┘  │                                   │
│  └───────────────────────────────────────┘                                   │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         EKSTERNE TJENESTER                                   │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────────┐ │
│  │   AI/LLM          │  │   GOOGLE MAPS     │  │   GOOGLE OAUTH            │ │
│  │  ┌─────────────┐  │  │  ┌─────────────┐  │  │  ┌─────────────────────┐  │ │
│  │  │ Azure OpenAI│  │  │  │ Geocoding   │  │  │  │ Brukerinnlogging    │  │ │
│  │  │ (GPT-4o)    │  │  │  │ Places API  │  │  │  └─────────────────────┘  │ │
│  │  ├─────────────┤  │  │  │ Kart        │  │  └───────────────────────────┘ │
│  │  │ Anthropic   │  │  │  └─────────────┘  │                                │
│  │  │ (Claude)    │  │  └───────────────────┘                                │
│  │  └─────────────┘  │                                                       │
│  └───────────────────┘                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Teknologi-stabel Oppsummering

### Frontend

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| Next.js | 14.2.15 | React-rammeverk med App Router og SSR |
| React | 18.3.1 | UI-bibliotek |
| TypeScript | 5.x | Typesikkerhet |
| Tailwind CSS | 3.4.1 | Utility-first CSS |
| shadcn/ui | - | Komponentbibliotek |
| Radix UI | Latest | Tilgjengelige UI-primitiver |
| Lucide React | 0.454.0 | Ikonbibliotek (450+ ikoner) |

### State Management

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| Zustand | 5.0.8 | Klient-side tilstandshåndtering |
| TanStack Query | 5.59.20 | Server state og caching |
| React Hook Form | 7.53.2 | Skjemahåndtering |
| Zod | 3.23.8 | Skjemavalidering |

### Backend & API

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| Next.js API Routes | 14.2.15 | REST API endepunkter |
| Server-Sent Events | - | Sanntids enveiskommunikasjon |
| NextAuth.js | 5.0.0-beta.30 | Autentisering |
| Prisma | 6.19.0 | ORM for database |

### Database

| Teknologi | Formål |
|-----------|--------|
| PostgreSQL (Vercel Postgres) | Primær database |
| Azure Table Storage | Sekundær lagring for bålmeldingsarkiv |

### AI/LLM Integrasjon

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| Vercel AI SDK | 5.0.89 | LLM abstraksjonsbibliotek |
| Azure OpenAI (GPT-4o) | - | Produksjon chatbot |
| Anthropic Claude | - | Utviklings chatbot |

### Kart & Geolokasjon

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| Google Maps API | 3.4.2 | Geocoding og reverse geocoding |
| @vis.gl/react-google-maps | 1.3.2 | React kartkomponent |

### Hosting & Deployment

| Teknologi | Formål |
|-----------|--------|
| Vercel | Hosting og deployment |
| Vercel Postgres | Managed PostgreSQL |

---

## Database Modeller (ER Diagram)

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Session     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ userId (FK)     │
│ email           │       │ sessionToken    │
│ name            │       │ expires         │
│ image           │       └─────────────────┘
│ role            │
│ whitelisted     │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Event       │       │  FlashMessage   │       │ VehicleStatus   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ title           │       │ message         │       │ vehicle         │
│ description     │       │ active          │       │ status          │
│ status          │       │ createdAt       │       │ updatedAt       │
│ priority        │       │ updatedAt       │       │ updatedBy       │
│ createdAt       │       └─────────────────┘       └─────────────────┘
│ updatedAt       │
│ createdBy       │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────────┐
│   DutyRoster    │       │   Talegruppe    │       │ BonfireRegistration │
├─────────────────┤       ├─────────────────┤       ├─────────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)             │
│ name            │       │ name            │       │ registrantName      │
│ role            │       │ frequency       │       │ phone               │
│ phone           │       │ description     │       │ email               │
│ startTime       │       │ active          │       │ address             │
│ endTime         │       │ createdAt       │       │ latitude            │
│ active          │       │ updatedAt       │       │ longitude           │
└─────────────────┘       └─────────────────┘       │ municipality        │
                                                    │ date                │
┌─────────────────┐                                 │ timeStart           │
│    AuditLog     │                                 │ timeEnd             │
├─────────────────┤                                 │ purpose             │
│ id (PK)         │                                 │ status              │
│ userId          │                                 │ aiConfidence        │
│ action          │                                 │ createdAt           │
│ tableName       │                                 │ updatedAt           │
│ recordId        │                                 └─────────────────────┘
│ oldValue        │
│ newValue        │
│ timestamp       │
└─────────────────┘
```

---

## Autentiseringsflyt

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Bruker  │────▶│Google OAuth │────▶│ NextAuth.js  │────▶│ Whitelist  │
│          │     │             │     │              │     │   sjekk    │
└──────────┘     └─────────────┘     └──────────────┘     └─────┬──────┘
                                                                │
                              ┌─────────────────────────────────┴─────────┐
                              │                                           │
                              ▼                                           ▼
                    ┌─────────────────┐                         ┌─────────────────┐
                    │    GODKJENT     │                         │     AVVIST      │
                    │  JWT Session    │                         │ /access-denied  │
                    │  (16 timer)     │                         │                 │
                    └─────────────────┘                         └─────────────────┘
```

### Roller (RBAC)

| Rolle | Tilganger |
|-------|-----------|
| OPERATOR | Dashboard, kart, bilstatus, vaktplan, bålmeldinger |
| ADMINISTRATOR | Alt over + brukeradministrasjon, innstillinger |

---

## Real-time Kommunikasjon (SSE)

```
                                    ┌─────────────────────┐
                                    │                     │
┌─────────────────┐                 │    SSE SERVER       │
│  Dispatcher 1   │◄────────────────│    /api/sse         │
└─────────────────┘                 │                     │
                                    │  Broadcaster:       │
┌─────────────────┐                 │  ┌───────────────┐  │
│  Dispatcher 2   │◄────────────────│  │ event_created │  │
└─────────────────┘                 │  │ event_updated │  │
                                    │  │ event_deleted │  │
┌─────────────────┐                 │  │ bilstatus_*   │  │
│  Dispatcher 3   │◄────────────────│  │ vaktplan_*    │  │
└─────────────────┘                 │  │ talegruppe_*  │  │
                                    │  │ bonfire_*     │  │
┌─────────────────┐                 │  │ flash_message │  │
│  Dispatcher N   │◄────────────────│  │ heartbeat     │  │
└─────────────────┘                 │  └───────────────┘  │
                                    │                     │
                                    └─────────────────────┘
```

### SSE Event Typer

| Event | Beskrivelse |
|-------|-------------|
| `connection` | Tilkobling etablert |
| `heartbeat` | Keep-alive (hvert 30. sekund) |
| `event_created` | Ny hendelse opprettet |
| `event_updated` | Hendelse oppdatert |
| `event_deleted` | Hendelse slettet |
| `bilstatus_update` | Kjøretøystatus endret |
| `vaktplan_update` | Vaktplan oppdatert |
| `talegruppe_*` | Talegruppe endringer |
| `bonfire_*` | Bålmelding hendelser |
| `flash_message` | Viktig systemmelding |

---

## API Endepunkter

### Offentlige

| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| GET | `/api/bonfires` | Hent bålmeldinger |
| POST | `/api/bonfires` | Registrer ny bålmelding |
| POST | `/api/chat/bonfire` | AI chat for bålregistrering |

### Beskyttede (krever innlogging)

| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| GET/POST | `/api/events` | CRUD for hendelser |
| GET/PUT | `/api/bilstatus` | Kjøretøystatus |
| GET/PUT | `/api/vaktplan` | Vaktplanhåndtering |
| GET/POST/PUT/DELETE | `/api/talegrupper` | Talegrupper |
| GET | `/api/sse` | SSE tilkobling |
| POST | `/api/audit` | Audit logging |

### Admin (krever ADMINISTRATOR rolle)

| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| GET/POST/DELETE | `/api/admin/whitelist` | Brukeradministrasjon |

---

## Mappestruktur

```
SG-Closed-Group/
├── app/                          # Next.js App Router
│   ├── api/                      # REST API routes
│   │   ├── events/              # Hendelser API
│   │   ├── bilstatus/           # Kjøretøystatus API
│   │   ├── vaktplan/            # Vaktplan API
│   │   ├── talegrupper/         # Talegrupper API
│   │   ├── bonfires/            # Bålmeldinger API
│   │   ├── chat/                # AI Chat API
│   │   ├── sse/                 # Server-Sent Events
│   │   ├── audit/               # Audit logging
│   │   └── admin/               # Admin endepunkter
│   ├── hva-skjer/               # Hovedside (dashboard)
│   ├── kart/                    # Kartvisning
│   ├── bilstatus/               # Kjøretøystatus side
│   ├── vaktplan/                # Vaktliste side
│   ├── balmelding/              # Bålregistrering
│   ├── rapporter/               # Rapporter
│   ├── innstillinger/           # Admin-innstillinger
│   ├── login/                   # Innloggingsside
│   ├── access-denied/           # Tilgang nektet
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Hjemmeside
│   └── globals.css              # Globale stiler
│
├── components/                   # React-komponenter
│   ├── ui/                      # shadcn/ui komponenter
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── providers/               # Context providers
│   │   ├── session-provider.tsx
│   │   └── sse-provider.tsx
│   ├── layout/                  # Layout komponenter
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── navigation.tsx
│   ├── hva-skjer/              # Dashboard komponenter
│   ├── bonfire/                # Bålmelding komponenter
│   ├── events/                 # Hendelse komponenter
│   └── bilstatus/              # Kjøretøystatus komponenter
│
├── lib/                         # Hjelpefunksjoner & tjenester
│   ├── auth.ts                 # NextAuth.js konfigurasjon
│   ├── prisma.ts               # Prisma client singleton
│   ├── sse.ts                  # Server-side SSE utilities
│   ├── sse-client.ts           # Client-side SSE tilkobling
│   ├── audit.ts                # Audit logging
│   ├── azure-table.ts          # Azure Table Storage
│   └── utils.ts                # Generelle utilities
│
├── stores/                      # Zustand state stores
│   └── useConnectionStore.ts   # SSE tilkoblingsstatus
│
├── prisma/                      # Database
│   └── schema.prisma           # Prisma schema
│
├── types/                       # TypeScript type definisjoner
│   └── next-auth.d.ts          # NextAuth session augmentation
│
├── middleware.ts                # Next.js middleware (auth)
├── tailwind.config.ts          # Tailwind CSS konfigurasjon
├── next.config.mjs             # Next.js konfigurasjon
├── tsconfig.json               # TypeScript konfigurasjon
├── package.json                # Dependencies
└── docs/                       # Dokumentasjon
```

---

## Dataflyt Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BRUKERHANDLING                                 │
│                                                                             │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────────────┐  │
│  │ Opprett   │    │ Oppdater  │    │  Slett    │    │ Registrer         │  │
│  │ hendelse  │    │ bilstatus │    │ talegruppe│    │ bålmelding        │  │
│  └─────┬─────┘    └─────┬─────┘    └─────┬─────┘    └─────────┬─────────┘  │
│        │                │                │                    │            │
└────────┼────────────────┼────────────────┼────────────────────┼────────────┘
         │                │                │                    │
         ▼                ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ROUTES                                     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     Validering & Autorisasjon                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   PostgreSQL    │      │    Audit Log        │      │   SSE Broadcast     │
│   (Prisma)      │      │    (compliance)     │      │   (real-time)       │
└─────────────────┘      └─────────────────────┘      └──────────┬──────────┘
                                                                  │
                                                                  ▼
                                                      ┌─────────────────────┐
                                                      │  Alle tilkoblede    │
                                                      │  klienter mottar    │
                                                      │  oppdatering        │
                                                      └─────────────────────┘
```

---

## AI Chatbot Flyt (Bålmelding)

```
┌──────────┐     ┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│  Bruker  │────▶│ Chat UI     │────▶│ /api/chat/    │────▶│ Azure OpenAI    │
│  skriver │     │             │     │ bonfire       │     │ (GPT-4o)        │
└──────────┘     └─────────────┘     └───────────────┘     └────────┬────────┘
                                                                    │
                                                                    ▼
                                                           ┌────────────────┐
                                                           │ AI ekstraherer │
                                                           │ data fra tekst │
                                                           └────────┬───────┘
                                                                    │
         ┌──────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────────────┐
│ Google Maps API │────▶│ Adresse         │────▶│ Lagre i PostgreSQL          │
│ (validering)    │     │ verifisert      │     │ + Azure Table Storage       │
└─────────────────┘     └─────────────────┘     └─────────────────────────────┘
```

---

## Miljøvariabler

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Autentisering
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# AI - Azure OpenAI (produksjon)
AZURE_OPENAI_API_KEY="your-azure-openai-key"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# AI - Anthropic (utvikling)
ANTHROPIC_API_KEY="your-anthropic-key"

# Azure Storage
AZURE_STORAGE_ACCOUNT="your-storage-account"
AZURE_STORAGE_KEY="your-storage-key"
AZURE_STORAGE_TABLE_NAME="BonfireRegistrations"

# Admin
ADMIN_PASSWORD="your-admin-password"
```

---

## Nøkkel Arkitektur-beslutninger

1. **Server-Sent Events (SSE) fremfor WebSockets**: Enklere implementasjon for enveis sanntidskommunikasjon, passer perfekt for et dispatch-senter hvor serveren broadcaster til klienter.

2. **Serverless-klar**: In-memory klientmap for SSE fungerer på Vercel; kan enkelt skaleres med Redis i produksjon.

3. **Dual AI-støtte**: Claude for utvikling/gratis tier, Azure OpenAI for produksjon (enterprise compliance).

4. **Whitelist-først autentisering**: Brukere må forhåndsgodkjennes før Google-innlogging aksepteres.

5. **Event-drevet arkitektur**: Alle endringer broadcastes via SSE til alle tilkoblede operatører.

6. **Komplett audit trail**: Full logg av alle endringer (userId, timestamp, tabell, aksjon, gamle/nye verdier).

7. **Multi-region støtte**: 29 norske kommuner på tvers av 3 regioner (Rogaland, Vestland, Agder).

---

## Støttede Kommuner (Bålmelding)

### Rogaland
Stavanger, Sandnes, Sola, Randaberg, Strand, Hjelmeland, Gjesdal, Time, Klepp, Hå, Eigersund, Lund, Sokndal, Bjerkreim, Kvitsøy

### Vestland
Sveio, Etne

### Agder
Flekkefjord, Kvinesdal, Sirdal, Farsund, Lyngdal, Hægebostad, Åseral, Audnedal, Marnardal, Lindesnes, Mandal

---

## Teknologi Versjoner (package.json)

```json
{
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "typescript": "5.x",

    "tailwindcss": "3.4.1",
    "@radix-ui/react-*": "latest",
    "lucide-react": "0.454.0",

    "zustand": "5.0.8",
    "@tanstack/react-query": "5.59.20",
    "react-hook-form": "7.53.2",
    "zod": "3.23.8",

    "next-auth": "5.0.0-beta.30",
    "@auth/prisma-adapter": "2.11.1",

    "@prisma/client": "6.19.0",
    "prisma": "6.19.0",

    "ai": "5.0.89",
    "@ai-sdk/anthropic": "2.0.42",
    "@ai-sdk/azure": "2.0.75",

    "@googlemaps/google-maps-services-js": "3.4.2",
    "@vis.gl/react-google-maps": "1.3.2",

    "@azure/data-tables": "13.3.2",

    "date-fns": "4.1.0"
  }
}
```

---

## Bruk dette dokumentet

Dette dokumentet er designet for å kunne lastes opp til en AI-tjeneste (som Claude, ChatGPT, eller lignende) for å:

1. **Generere bedre visuelle diagrammer** - Be AI om å lage Mermaid, PlantUML, eller andre diagram-formater
2. **Lage arkitektur-presentasjoner** - Konverter til slides eller dokumenter
3. **Utforske arkitekturen** - Still spørsmål om spesifikke deler av systemet
4. **Planlegge utvidelser** - Bruk som grunnlag for nye features

### Eksempel prompts for andre AI-er:

- "Konverter dette til et Mermaid diagram"
- "Lag en interaktiv HTML-side med denne arkitekturen"
- "Generer et C4-modell diagram basert på denne informasjonen"
- "Lag en presentasjon med 10 slides som forklarer denne arkitekturen"
- "Foreslå forbedringer til denne arkitekturen"

---

*Generert: 2025-11-29*
*Prosjekt: Hva Skjer - 110 Sør-Vest*
