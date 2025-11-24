# AI Chatbot Setup Guide - Bålmelding

## Oversikt

En intelligent chatbot som erstatter det gamle Forms-skjemaet for bålmelding. Chatboten bruker **Claude 3.5 Haiku** til å:
- Samle inn informasjon i naturlig dialog på norsk
- Validere telefonnummer (8 siffer)
- Validere adresser med Google Maps Geocoding API
- Lagre strukturert data i PostgreSQL database

---

## 🎯 Fordeler vs. Forms

| Feature | Gammelt Forms | Ny AI Chatbot |
|---------|---------------|---------------|
| **Brukeropplevelse** | Statisk skjema | Naturlig samtale |
| **Adressevalidering** | Ingen | Google Maps API |
| **Feilhåndtering** | Etter submit | Sanntid under samtale |
| **Datakvalitet** | Lav (mange feil) | Høy (validert) |
| **Mobilopplevelse** | Dårlig | Utmerket |

---

## 📋 Forutsetninger

Før du starter, trenger du:

1. ✅ **Node.js 20** installert
2. ✅ **PostgreSQL database** (Vercel Postgres, Supabase, eller Neon anbefales)
3. ✅ **Google Cloud konto** (for Maps API)
4. ✅ **Anthropic API-nøkkel** (gratis $5 kredit)

---

## 🚀 Rask start (5 minutter)

### 1. Installer dependencies

Allerede gjort! Men hvis du trenger å reinstallere:

```bash
npm install
```

### 2. Sett opp Anthropic API-nøkkel

**a) Gå til https://console.anthropic.com/**
- Opprett gratis konto
- Få $5 gratis kredit (holder for ~8,300 bålmeldinger!)
- Generer API-nøkkel

**b) Opprett `.env.local` fil i prosjektets rot:**

```bash
# Kopier fra .env.example
cp .env.example .env.local
```

**c) Legg til Anthropic API-nøkkel:**

```env
ANTHROPIC_API_KEY="sk-ant-api03-YOUR-KEY-HERE"
```

### 3. Sett opp Google Maps API

**a) Gå til https://console.cloud.google.com/**

**b) Opprett nytt prosjekt eller bruk eksisterende**

**c) Aktiver disse API-ene:**
- Geocoding API
- Maps JavaScript API (for fremtidig kartvisning)

**d) Opprett API-nøkkel:**
1. Gå til "Credentials"
2. "Create Credentials" → "API Key"
3. Kopier nøkkelen

**e) Legg til i `.env.local`:**

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR-GOOGLE-MAPS-API-KEY"
```

**f) VIKTIG - Sikre API-nøkkelen:**

I Google Cloud Console, legg til restriksjoner:
- **Application restrictions:** HTTP referrers
  - `http://localhost:3000/*`
  - `https://your-domain.vercel.app/*`
- **API restrictions:**
  - Geocoding API
  - Maps JavaScript API

### 4. Sett opp database

Hvis databasen ikke allerede er satt opp:

**a) Opprett PostgreSQL database** (f.eks. på Vercel Postgres)

**b) Legg til DATABASE_URL i `.env.local`:**

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**c) Push database schema:**

```bash
npx prisma generate
npx prisma db push
```

### 5. Start utviklingsserver

```bash
npm run dev
```

### 6. Test chatboten!

Åpne **http://localhost:3000/bonfire-registration**

Du skal nå se chatboten! 🎉

---

## 💬 Testing chatbot-flyten

### Eksempel samtale:

```
Bot: Hei! 👋 Jeg hjelper deg med å registrere en bålmelding til 110 Sør-Vest.
     La oss begynne - hva er navnet ditt?

Du: Ola Nordmann

Bot: Takk, Ola! Hva er telefonnummeret ditt?

Du: 98765432

Bot: ✅ Gyldig norsk nummer: 987 65 432
     Hvor skal bålet være? (Oppgi adresse med postnummer)

Du: Storgata 12, Stavanger

Bot: Sjekker adressen... ✅ Fant adressen!
     Er dette riktig: Storgata 12, 4006 Stavanger, Norge?

Du: Ja

Bot: Perfekt! Hva er din e-postadresse? (valgfritt)

Du: ola@example.com

Bot: Når skal bålet starte? (Oppgi dato og klokkeslett)

... osv
```

### Viktige testscenarier:

1. **Ugyldig telefonnummer:**
   - Test: "12345" → Får feilmelding
   - Test: "12345678" → Får feilmelding (starter ikke med 4 eller 9)
   - Test: "98765432" → ✅ OK

2. **Ugyldig adresse:**
   - Test: "Xyz 999" → "Fant ikke adressen"
   - Bot hjelper deg med å presisere

3. **Gyldig flyt:**
   - Fullfør en registrering
   - Sjekk at den lagres i database: `npx prisma studio`

---

## 🏗️ Teknisk arkitektur

### Filstruktur:

```
app/
├── api/
│   └── chat/
│       └── bonfire/
│           └── route.ts          # Chatbot API med AI tools
└── bonfire-registration/
    └── page.tsx                  # Frontend chat UI

lib/
├── auth.ts                       # NextAuth config
└── prisma.ts                     # Prisma client

prisma/
└── schema.prisma                 # Database schema
    └── BonfireNotification model
```

### AI Tools (Verktøy chatboten bruker):

1. **`validatePhoneNumber`**
   - Validerer norske mobilnummer (8 siffer, starter med 4/9)
   - Formaterer output: "987 65 432"

2. **`validateAddress`**
   - Kaller Google Maps Geocoding API
   - Returnerer: lat/lng, kommune, formatert adresse
   - Håndterer ukjente adresser

3. **`saveBonfireNotification`**
   - Lagrer til PostgreSQL via Prisma
   - Validerer datoer (må være i fremtiden)
   - Returnerer referansenummer

### Hvordan chatboten fungerer:

```
1. Bruker sender melding
   ↓
2. Vercel AI SDK sender til Claude 3.5 Haiku
   ↓
3. Claude analyserer behov og kaller tools:
   - validatePhoneNumber(phoneNumber: "98765432")
   - validateAddress(address: "Storgata 12, Stavanger")
   ↓
4. Tools returnerer data til Claude
   ↓
5. Claude formulerer svar på norsk
   ↓
6. Streaming respons til frontend
```

---

## 🔒 Sikkerhet og GDPR

### Dataflyt:

1. **Bruker → Frontend** (SSL/TLS)
2. **Frontend → Next.js API** (server-side)
3. **Next.js → Anthropic API** (HTTPS, EU-servere)
4. **Next.js → Google Maps API** (HTTPS)
5. **Next.js → PostgreSQL** (encrypted connection)

### GDPR-compliance:

- ✅ Samtykke innhentes i UI (tekst nederst)
- ✅ Data lagres kun i EU/Norge
- ✅ Anthropic lagrer IKKE samtaler (enterprise tier)
- ✅ Automatisk sletting etter 90 dager (se schema.prisma)
- ✅ Right to deletion via admin-panel (TODO)

### API-nøkkel sikring:

- ❌ **ALDRI** commit `.env.local` til Git
- ✅ Bruk environment variables i Vercel
- ✅ Sett HTTP referrer restrictions på Google Maps API
- ✅ Roter API-nøkler hvert kvartal

---

## 📊 Kostnader (gratis tier)

| Tjeneste | Gratis tier | Tilstrekkelig for student? |
|----------|-------------|----------------------------|
| **Anthropic Claude** | $5 kredit | ✅ ~8,300 bålmeldinger |
| **Google Maps Geocoding** | $200/måned kredit | ✅ ~40,000 adressevalideringer |
| **Vercel Postgres** | Hobby plan gratis | ✅ 256 MB database |
| **Vercel Hosting** | Hobby plan gratis | ✅ 100 GB bandwidth |

**Total kostnad:** $0 for studentprosjekt! 🎉

---

## 🐛 Feilsøking

### "ANTHROPIC_API_KEY is not defined"
→ Sjekk at `.env.local` finnes og inneholder nøkkelen
→ Restart dev server: `npm run dev`

### "Google Maps API request denied"
→ Sjekk at Geocoding API er aktivert i Google Cloud Console
→ Sjekk at API-nøkkel har riktige rettigheter

### Chatbot svarer ikke
→ Åpne developer console (F12) og sjekk for feil
→ Sjekk at `/api/chat/bonfire` returnerer 200 OK

### Database feil
→ Sjekk at Prisma er generert: `npx prisma generate`
→ Sjekk at schema er pushet: `npx prisma db push`

### "Too many requests"
→ Anthropic free tier limit: 5 requests/min
→ Vent 1 minutt eller oppgrader til betalt plan

---

## 🚀 Deployment til Vercel

### 1. Push kode til GitHub
```bash
git add .
git commit -m "Add chatbot for bonfire registration"
git push
```

### 2. Gå til Vercel Dashboard
- https://vercel.com
- "Import Project"
- Velg GitHub repository

### 3. Legg til environment variables
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (sett til din Vercel URL)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 4. Deploy!
- Vercel bygger og deployer automatisk
- Få URL: `https://your-project.vercel.app`

### 5. Test produksjon
- Gå til `https://your-project.vercel.app/bonfire-registration`
- Test en komplett registrering

---

## 📈 Fremtidige forbedringer

### Fase 1 (nå):
- ✅ Chatbot for bålmelding
- ✅ Validering av telefon og adresse
- ✅ Database-lagring

### Fase 2 (neste sprint):
- [ ] Operator dashboard med kart
- [ ] Real-time oppdateringer (SSE)
- [ ] E-postvarsel til operatører
- [ ] Admin-panel for whitelist

### Fase 3 (kommersiell):
- [ ] Migrer til Azure OpenAI (enterprise)
- [ ] Self-hosted Llama 3.3 backup (offline-mode)
- [ ] Multi-språk (engelsk, polsk, litauisk)
- [ ] Stemmestyrt registrering (WhisperAI)

---

## 🤝 Support

**Spørsmål?**
- Sjekk dokumentasjon: `README.md` og `proposal.md`
- Test lokalt: `npm run dev`
- Åpne issue på GitHub

**Kontakt:**
- Prosjekteiere: [Legg til navn]
- Kurs: IBE160 - Programmering med KI

---

## 📝 Lisens

Studentprosjekt for utdanningsformål.
Planlagt kommersialisering til 110 Sør-Vest og andre nødetater.

---

**Lykke til med chatboten! 🔥🚒**
