# Azure OpenAI Setup Guide - Steg for Steg

## 🎯 Hvorfor Azure OpenAI er perfekt for dere

✅ **Enterprise-grade** - Produksjonsklart
✅ **GDPR-compliant** - Data lagres i EU/Norge
✅ **Offentlig sektor-vennlig** - Microsoft er allerede godkjent leverandør
✅ **Student-tilgang** - Gratis via Azure for Students
✅ **Bedre for kommersialisering** - Kan selges til 110 Sør-Vest

---

## 📋 Del 1: Sjekk dine Azure-tilganger

### Steg 1.1: Logg inn på Azure Portal

1. Gå til **https://portal.azure.com**
2. Logg inn med din student-konto

### Steg 1.2: Sjekk om du har Azure OpenAI-tilgang

Azure OpenAI krever **spesiell tilgang** (ikke alle Azure-kontoer har det automatisk).

**Test 1 - Søk etter Azure OpenAI:**
1. I Azure Portal, klikk på søkefeltet øverst
2. Skriv: `Azure OpenAI`
3. Se om du får opp "Azure OpenAI" som en tjeneste

**Resultat:**
- ✅ **Ser du "Azure OpenAI"?** → Du har tilgang! Gå til Del 2
- ❌ **Får du ikke opp "Azure OpenAI"?** → Du må søke om tilgang (se Del 1.3)

### Steg 1.3: Søke om Azure OpenAI-tilgang (hvis nødvendig)

Hvis du IKKE har tilgang ennå:

1. Gå til: **https://aka.ms/oai/access**
2. Fyll ut skjemaet med:
   - **Organization name:** Ditt universitet/høyskole
   - **Use case:** "Student project - Emergency services bonfire notification system for 110 Sør-Vest"
   - **Contact email:** Din student-epost
   - **Reason:** "Educational project with potential commercial deployment to Norwegian emergency services"

**Behandlingstid:** Vanligvis 1-2 virkedager (kan være raskere for student-kontoer)

⚠️ **OBS:** Hvis du må vente på tilgang, kan du i mellomtiden fortsette å bruke Anthropic Claude (som jeg allerede har satt opp).

---

## 📋 Del 2: Opprett Azure OpenAI Resource (forutsetter at du har tilgang)

### Steg 2.1: Opprett ny Azure OpenAI-ressurs

1. I Azure Portal, klikk på **"+ Create a resource"** (øverst til venstre)
2. Søk etter: `Azure OpenAI`
3. Klikk på **"Azure OpenAI"**
4. Klikk på **"Create"**

### Steg 2.2: Konfigurer ressursen

**Subscription:**
- Velg din student-subscription (vanligvis "Azure for Students")

**Resource Group:**
- Opprett ny: `sg-closed-group-rg`
- Eller bruk eksisterende hvis du har

**Region (VIKTIG!):**
Velg en av disse (har GPT-4o tilgjengelig):
- ✅ **Sweden Central** (anbefalt - nærmest Norge)
- ✅ **West Europe** (Nederland)
- ✅ **North Central US** (hvis EU-regioner er fulle)

**Name:**
- Skriv: `sg-closed-group-openai` (må være globalt unikt)
- Hvis navnet er tatt, prøv: `sg-closed-group-openai-[ditt brukernavn]`

**Pricing tier:**
- Velg: **Standard S0** (pay-as-you-go)
- Student-kontoer har vanligvis gratis kreditt ($100-200)

### Steg 2.3: Oppretting

1. Klikk **"Review + create"**
2. Vent på validering (tar ~30 sekunder)
3. Klikk **"Create"**
4. Vent på deployment (~2-3 minutter)
5. Klikk **"Go to resource"** når ferdig

---

## 📋 Del 3: Deploy GPT-4o modellen

### Steg 3.1: Gå til Azure OpenAI Studio

1. I din Azure OpenAI-ressurs, klikk på **"Go to Azure OpenAI Studio"** (stor blå knapp)
2. Eller gå direkte til: **https://oai.azure.com**
3. Logg inn med samme konto

### Steg 3.2: Deploy en modell

1. I menyen til venstre, klikk på **"Deployments"** (rakettikon)
2. Klikk på **"+ Create new deployment"**

**Konfigurer deployment:**

**Model:**
- Velg: **gpt-4o** (nyeste versjon, f.eks. `gpt-4o (2024-08-06)`)

**Deployment name:**
- Skriv: `gpt-4o` (dette navnet bruker vi i koden)
- ⚠️ **VIKTIG:** Husk dette navnet!

**Deployment type:**
- Velg: **Standard**

**Tokens per Minute Rate Limit (TPM):**
- Sett til: **10K** (eller høyere hvis tilgjengelig)
- Dette er nok for studentprosjekt

### Steg 3.3: Bekreft deployment

1. Klikk **"Create"**
2. Vent ~1 minutt
3. Du skal nå se din deployment i listen med status **"Succeeded"** ✅

---

## 📋 Del 4: Hent API-nøkler og endpoint

### Steg 4.1: Finn ditt endpoint

**Metode 1 - Fra Azure Portal:**
1. Gå tilbake til Azure Portal (https://portal.azure.com)
2. Gå til din Azure OpenAI-ressurs (`sg-closed-group-openai`)
3. Klikk på **"Keys and Endpoint"** i venstre meny
4. Kopier **"Endpoint"** (ser ut som: `https://sg-closed-group-openai.openai.azure.com/`)

**Metode 2 - Fra OpenAI Studio:**
1. I Azure OpenAI Studio, klikk på **"Deployments"**
2. Klikk på din `gpt-4o` deployment
3. Klikk på **"Open in Playground"**
4. I Playground, klikk på **"View code"**
5. Finn endpoint i kodeeksemplet

### Steg 4.2: Hent API-nøkkel

1. I Azure Portal → Din Azure OpenAI-ressurs
2. Klikk på **"Keys and Endpoint"**
3. Kopier **"KEY 1"** (lang streng med tall og bokstaver)

⚠️ **VIKTIG:**
- Del ALDRI denne nøkkelen offentlig
- Commit den IKKE til Git
- Bruk kun i `.env.local`

### Steg 4.3: Verifiser informasjon

Du skal nå ha disse tre tingene:

```
✅ Endpoint:         https://[DITT-NAVN].openai.azure.com/
✅ API Key:          abc123...xyz789
✅ Deployment name:  gpt-4o
```

---

## 📋 Del 5: Konfigurer miljøvariabler

### Steg 5.1: Opprett eller rediger `.env.local`

I prosjektets rotmappe:

```bash
# Hvis filen ikke finnes:
cp .env.example .env.local

# Rediger filen:
code .env.local  # eller bruk annen editor
```

### Steg 5.2: Legg til Azure OpenAI-variabler

Erstatt/legg til disse linjene i `.env.local`:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="DIN-API-NØKKEL-HER"
AZURE_OPENAI_ENDPOINT="https://DITT-NAVN.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"

# Google Maps API (samme som før)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="din-google-maps-nøkkel"

# Database (samme som før)
DATABASE_URL="din-database-url"

# NextAuth (samme som før)
NEXTAUTH_SECRET="din-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="din-google-client-id"
GOOGLE_CLIENT_SECRET="din-google-client-secret"
```

**Eksempel på utfylt Azure-seksjon:**
```env
AZURE_OPENAI_API_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
AZURE_OPENAI_ENDPOINT="https://sg-closed-group-openai.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

### Steg 5.3: Verifiser at filen er korrekt

```bash
# Sjekk at .env.local ikke committes til Git:
cat .gitignore | grep "\.env"
# Skal vise: .env*
```

---

## 📋 Del 6: Oppdater chatbot-koden

Jeg har allerede laget koden med Anthropic Claude. Nå oppdaterer vi den til å bruke Azure OpenAI.

### Steg 6.1: Installer Azure OpenAI SDK

```bash
npm install @ai-sdk/azure
```

### Steg 6.2: Oppdater API-ruten

Jeg skal nå oppdatere `/app/api/chat/bonfire/route.ts` til å bruke Azure i stedet for Anthropic.

*(Se neste fil for oppdatert kode)*

---

## 📋 Del 7: Test at alt fungerer

### Steg 7.1: Start utviklingsserver

```bash
npm run dev
```

### Steg 7.2: Åpne chatboten

Gå til: **http://localhost:3000/bonfire-registration**

### Steg 7.3: Test en samtale

Prøv denne flyten:

```
Bot: Hei! 👋 Jeg hjelper deg...

Du: Ola Nordmann

Bot: Takk, Ola! Hva er telefonnummeret ditt?

Du: 98765432

Bot: ✅ Gyldig norsk nummer: 987 65 432
     Hvor skal bålet være?

Du: Storgata 12, Stavanger

Bot: [Validerer adresse...]
     ✅ Fant adressen: Storgata 12, 4006 Stavanger
```

### Steg 7.4: Sjekk for feil

**Åpne Developer Console** (F12 i nettleseren):
- ✅ Ingen røde feilmeldinger? → Alt fungerer!
- ❌ Feilmelding? → Se Feilsøking (Del 8)

---

## 📋 Del 8: Feilsøking

### Problem 1: "Invalid API key"

**Løsning:**
1. Sjekk at `AZURE_OPENAI_API_KEY` i `.env.local` er korrekt
2. Gå til Azure Portal → Din ressurs → "Keys and Endpoint"
3. Kopier KEY 1 på nytt
4. Restart dev server: `npm run dev`

### Problem 2: "Deployment not found"

**Løsning:**
1. Sjekk at `AZURE_OPENAI_DEPLOYMENT="gpt-4o"` matcher navnet i Azure
2. Gå til Azure OpenAI Studio → Deployments
3. Sjekk nøyaktig navn på din deployment
4. Oppdater `.env.local` hvis forskjellig

### Problem 3: "Resource not found"

**Løsning:**
1. Sjekk at `AZURE_OPENAI_ENDPOINT` er korrekt
2. Skal slutte med `/` (slash)
3. Eksempel: `https://navn.openai.azure.com/` (ikke .com)

### Problem 4: "Rate limit exceeded"

**Løsning:**
1. Student-kontoer har lavere rate limits
2. Vent 1 minutt og prøv igjen
3. Eller øk TPM i Azure Portal → Deployment settings

### Problem 5: Chatbot svarer ikke

**Løsning:**
1. Åpne Developer Console (F12)
2. Se på Network-fanen
3. Sjekk om `/api/chat/bonfire` returnerer feil
4. Les feilmeldingen og følg instruksjonene

---

## 📋 Del 9: Sjekkliste før du fortsetter

Before you continue, make sure you have:

- [ ] ✅ Tilgang til Azure OpenAI (bekreftet i Portal)
- [ ] ✅ Azure OpenAI-ressurs opprettet
- [ ] ✅ GPT-4o modell deployet (deployment name: `gpt-4o`)
- [ ] ✅ API-nøkkel og endpoint kopiert
- [ ] ✅ `.env.local` fil konfigurert korrekt
- [ ] ✅ `npm install @ai-sdk/azure` kjørt
- [ ] ✅ Chatbot-kode oppdatert (neste steg)
- [ ] ✅ Testet chatbot lokalt (fungerer uten feil)

---

## 💰 Kostnader med Azure OpenAI (Student)

| Ressurs | Student-tilgang | Kostnad |
|---------|-----------------|---------|
| **Azure for Students** | $100 gratis kredit/år | $0 |
| **GPT-4o API** | ~$2.50 per 1M input tokens | ~$0.005 per bålmelding |
| **1000 bålmeldinger** | Ca. 2M tokens totalt | ~$5 (dekket av gratis kredit) |

**Konklusjon:** Mer enn nok for studentprosjekt! 🎉

---

## 🚀 Neste steg etter setup

Når Azure OpenAI er satt opp og fungerer:

1. **Test grundig** - Registrer flere bålmeldinger
2. **Sjekk database** - Bruk `npx prisma studio` for å se data
3. **Deploy til Vercel** - Legg til samme environment variables
4. **Lag operator-dashboard** - Vis bålmeldinger på kart
5. **Implementer real-time updates** - SSE for live oppdateringer

---

## 📚 Ressurser

- **Azure OpenAI Docs:** https://learn.microsoft.com/en-us/azure/ai-services/openai/
- **Vercel AI SDK + Azure:** https://sdk.vercel.ai/providers/ai-sdk-providers/azure
- **Azure Portal:** https://portal.azure.com
- **Azure OpenAI Studio:** https://oai.azure.com

---

## ❓ Spørsmål?

Hvis du står fast på noe:
1. Sjekk feilsøkingsseksjonen (Del 8)
2. Se på Azure Portal logs
3. Åpne Developer Console i nettleseren
4. Spør meg! 😊

---

**Lykke til med Azure OpenAI-oppsettet! 🎯**
