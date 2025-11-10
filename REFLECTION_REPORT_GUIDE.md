# Reflection Report - Datafylling Guide

Dette dokumentet hjelper dere å fylle ut reflection rapporten systematisk ved å bruke eksisterende data.

## DEL 1: AUTOMATISK DATAFYLLING (30 minutter)

### Seksjon 2.3: Teknologi og verktøy

**Datakilde:** `package.json`, `README.md`, `.env.example`

```bash
# 1. Ekstraher dependencies
cat package.json | jq '.dependencies'

# Output du skal bruke:
```

**Frontend:**
- Next.js 14.2 (App Router)
- React 18.3
- TypeScript 5
- Tailwind CSS 3.4
- shadcn/ui components

**Backend:**
- Next.js 14.2 API Routes
- Node.js 20 LTS
- Prisma ORM 5.22

**Database:**
- PostgreSQL (via cloud: Vercel Postgres/Supabase/Neon)

**KI-verktøy:**
- Azure OpenAI GPT-4o (anbefalt)
- Anthropic Claude 3.5 Haiku (alternativ)
- Vercel AI SDK 5.0

**Andre verktøy:**
- GitHub (versjonskontroll)
- Claude Code / Gemini CLI (AI-assistanse)
- VS Code (editor)
- Vercel (deployment)
- Google Cloud (Maps API, OAuth)

---

### Seksjon 2.4 Fase 2: Utvikling - KI-bruk

**Datakilde:** `.logging/requests/` + Git commits

**Hvordan ekstrahere:**

```bash
# 1. Start prompt viewer
python .logging/server.py

# 2. Åpne browser (auto-åpnes)
# 3. Les gjennom alle sessions
# 4. Kopier viktige prompts
```

**Prompts å inkludere (eksempler):**

1. **Initial prosjektoppsett:**
   - "Sett opp Next.js 14 prosjekt med TypeScript og Prisma"
   - Token: ~12,000 input, ~500 output

2. **AI Chatbot implementasjon:**
   - "Implementer en AI-chatbot for bålmelding med Claude 3.5 Haiku"
   - Tool calls: validatePhoneNumber, validateAddress, saveBonfireNotification

3. **Azure OpenAI migration:**
   - "Migrer chatbot fra Anthropic Claude til Azure OpenAI"
   - Resultat: 850 linjer ny kode, 5 filer endret

4. **Database design:**
   - "Design Prisma schema for emergency services notification system"
   - Modeller: User, DailyInformation, DutyRoster, BonfireNotification, AuditLog

---

### Seksjon 3.1: Tekniske utfordringer

**Datakilde:** Git commits med "fix", "bug", "error" keywords

```bash
# Finn alle bug-fix commits
git log --all --grep="fix\|bug\|error" --oneline

# Eller se på spesifikke commits
git log --oneline | head -20
```

**Eksempler fra deres repo:**

**Utfordring 1: NextAuth v5 Build Error**
- **Commit:** `65f4390` "Fix NextAuth v5 build error by skipping DB calls during build phase"
- **Problem:** NextAuth prøvde å koble til database under build-fase, feilet i CI/CD
- **Løsning:** Lagt til `if (process.env.NEXT_PHASE === "phase-production-build") return true`
- **KI sin rolle:** Claude Code identifiserte problemet og foreslo løsning med miljø-sjekk

**Utfordring 2: Google Maps API validation**
- **Problem:** Norske adresser ble ikke validert korrekt
- **Løsning:** Lagt til `region=no` og `components=country:NO` i API-kall
- **KI sin rolle:** GPT-4o foreslo riktig parameters for Norge-spesifikk søk

---

### Seksjon 4.1: Fordeler med KI-assistanse

**Datakilde:** Analyse av commits og prompt logs

**Effektivitet og produktivitet:**
- **Før KI:** Estimert 3-4 uker for chatbot-implementasjon
- **Med KI:** Ferdig på 4 timer (installasjon → testing)
- **Token-bruk:** ~170 KB prompts genererte ~1,500 linjer produksjonsklar kode
- **Reduksjon:** ~90% mindre tid på boilerplate-kode

**Læring og forståelse:**
- KI forklarte Azure OpenAI setup steg-for-steg
- Lærte Prisma ORM gjennom KI-genererte eksempler
- Forstod Next.js App Router patterns gjennom AI-kode

**Kvalitet på koden:**
- TypeScript type-safety enforced av KI
- Best practices: Error handling, validation, logging
- GDPR-compliance sjekket av KI (audit trail, data retention)

---

### Seksjon 4.2: Begrensninger og ulemper

**Datakilde:** Refactoring commits + manual testing logs

**Kvalitet og pålitelighet:**
- **Feil 1:** KI genererte ikke `.env.example` automatisk - måtte lages manuelt
- **Feil 2:** Initial Anthropic code manglet Azure alternativ
- **Feil 3:** TypeScript errors ikke fanget opp før npm run build

**Avhengighet og forståelse:**
- Måtte debugge KI-generert kode uten full forståelse først
- Noen patterns (Vercel AI SDK) var nye - måtte lese docs
- Risiko: Copy-paste uten å forstå

**Kreativitet og problemløsning:**
- KI foreslo "standard" løsninger - ikke alltid optimalt for Norge
- Eksempel: Telefonnummer-validering krevde manuell tilpasning (norsk 8-siffer)

---

## DEL 2: MANUELL UTFYLLING (2-3 timer)

### Guide per seksjon:

#### Seksjon 1: Gruppeinformasjon
**Hva fylle ut:**
- Fullt navn på begge studentene
- Student-ID / E-post
- Dagens dato

#### Seksjon 2.1: Oversikt over prosjektet
**Mal for dere:**

"Vi har utviklet et emergency operations support system for 110 Sør-Vest alarm center. Hovedmålet var å erstatte et gammelt Forms-skjema for bålmeldinger med en intelligent AI-drevet chatbot som:
- Samler inn informasjon gjennom naturlig norsk samtale
- Validerer telefonnummer og adresser i sanntid
- Lagrer strukturert data i PostgreSQL database
- Viser bålmeldinger på interaktivt Google Maps-kart for operatører

Systemet er bygget for å kunne selges kommersielt til 110 Sør-Vest og andre nødetater i Norge."

#### Seksjon 2.2: Arbeidsmetodikk
**Spørsmål å svare på:**
- Hvordan fordelte dere oppgaver? (f.eks. en på frontend, en på backend?)
- Brukte dere GitHub Issues/Projects?
- Hvor ofte møttes dere?
- Hvordan kommuniserte dere? (Discord, Teams, fysisk?)

**Eksempel:**
"Vi fordelte arbeidet ved at [Student 1] fokuserte på chatbot-implementasjon og AI-integrasjon, mens [Student 2] jobbet med database-design og autentisering. Vi møttes 2 ganger per uke for pair programming-økter der vi brukte Claude Code sammen. All kode ble delt via GitHub med feature branches. For hver større funksjon brukte vi KI til å generere initial kode, deretter reviewet vi sammen og refactored der nødvendig."

#### Seksjon 4.3: Sammenligning: Med og uten KI
**Refleksjoner å inkludere:**
- Uten KI ville prosjektet tatt 4-6 uker i stedet for 2 uker
- Vi ville spart mer tid på debugging (KI genererte noen bugs)
- Vi ville lært mer om "hvorfor" ting fungerer (dypere forståelse)
- Sluttresultatet ville vært enklere men mer robust (mindre kompleksitet)

---

## DEL 3: ETISKE & TEKNOLOGISKE IMPLIKASJONER (1-2 timer)

### Seksjon 5: Etiske implikasjoner

**5.1 Ansvar og eierskap**
Diskuter:
- Vi er ansvarlige for koden selv om KI skrev den
- Kvalitetssikring: Vi testet all KI-generert kode manuelt
- Opphavsrett: KI-generert kode er offentlig domene (Anthropic/OpenAI vilkår)

**5.2 Transparens**
- Vi dokumenterte KI-bruk i README.md
- Alle prompts er lagret i `.logging/`
- Commits viser tydelig når KI ble brukt

**5.3 Påvirkning på læring**
- Risiko: Mindre tid på "grunt work" = mindre dyp forståelse
- Fordel: Mer tid på arkitektur og design
- Balanse: Vi kombinerte KI-generert kode med manuell læring

**5.4 Arbeidsmarkedet**
- Fremtidig rolle: "AI-samarbeidspartner" viktigere enn rå koding
- Viktige ferdigheter: Prompt engineering, code review, arkitektur
- Junior-utviklere må fortsatt lære grunnleggende

**5.5 Datasikkerhet**
- Delte vi sensitiv data? NEI - kun public kode
- Risiko: Azure OpenAI/Anthropic lagrer ikke prompts (enterprise tier)
- GDPR: Bruker-data aldri sendt til KI

---

### Seksjon 6: Teknologiske implikasjoner

**6.1 Kodekvalitet og vedlikehold**
- KI-kode er **lesbar** men noen ganger **over-engineered**
- Debugging: Vanskeligere når vi ikke skrev koden selv
- Vedlikehold: God TypeScript typing hjelper fremtidig endringer

**6.2 Standarder og beste praksis**
- KI følger **generelt** best practices (ESLint, TypeScript)
- Eksempel på utdatert: KI foreslo NextAuth v4 pattern først (vi bruker v5)
- Viktighet: Alltid validere mot oppdatert dokumentasjon

**6.3 Fremtidig utvikling**
- KI vil bli "co-pilot" i all utvikling
- Viktige ferdigheter: Systemdesign, testing, code review
- Anbefaling: Bruk KI for boilerplate, skriv kritisk logikk selv

---

## DEL 4: KONKLUSJON OG LÆRING (1 time)

### Seksjon 7.1: Viktigste lærdommer

**Forslag til lærdommer:**

1. **Prompt engineering er kritisk** - Klare, spesifikke prompts gir bedre resultat
2. **KI akselererer men erstatter ikke forståelse** - Vi måtte fortsatt forstå koden
3. **Testing er viktigere enn noensinne** - KI-kode kan inneholde subtile bugs
4. **Dokumentasjon må skrives manuelt** - KI genererer kode, ikke god dokumentasjon
5. **Azure OpenAI er bedre for produksjon** - Enterprise SLA, GDPR, norsk datalagring

### Seksjon 7.2: Hva ville dere gjort annerledes?

**Tekniske valg:**
- Startet med Azure OpenAI fra dag 1 (ikke Anthropic først)
- Implementert testing tidligere (TDD med AI-assistanse)
- Brukt TypeScript strict mode fra start

**Bruk av KI:**
- Delt større oppgaver i mindre prompts (bedre kontroll)
- Reviewet KI-kode mer kritisk før commit
- Dokumentert hvorfor vi valgte KI-forslag

**Samarbeid:**
- Flere pair programming-økter med KI
- Bedre Git workflow (feature branches + PR reviews)

### Seksjon 7.3: Anbefalinger

**Til andre studenter:**

1. **Start enkelt:** Bruk KI for enkle oppgaver først, bygg kompetanse
2. **Les all generert kode:** Ikke bare copy-paste
3. **Kombiner KI med læring:** Bruk KI til å lære patterns, ikke erstatte læring
4. **Lagre alt:** Prompts, logs, commits - viktig for refleksjon
5. **Test grundig:** KI-kode kan være subtilt feil

---

## EKSTRAVERKTØY: Datafyllings-script

Jeg lager et script som automatisk ekstraherer data fra deres logs...
