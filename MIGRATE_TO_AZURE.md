# Migrering fra Anthropic Claude til Azure OpenAI

Denne guiden viser hvordan du bytter fra Anthropic Claude til Azure OpenAI.

## 📋 Forutsetninger

- ✅ Du har fulgt **AZURE_OPENAI_SETUP.md** og har:
  - Azure OpenAI-ressurs opprettet
  - GPT-4o modell deployet
  - API-nøkkel og endpoint

## 🚀 Steg 1: Installer Azure SDK

```bash
npm install @ai-sdk/azure
```

## 🚀 Steg 2: Oppdater environment variables

Rediger `.env.local` og **legg til** disse variablene:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="din-api-nøkkel"
AZURE_OPENAI_ENDPOINT="https://ditt-navn.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

Du kan **beholde** Anthropic-nøkkelen som fallback hvis du vil:
```env
# Optional: Keep as fallback
ANTHROPIC_API_KEY="sk-ant-..."
```

## 🚀 Steg 3: Bytt ut chatbot API-filen

**Metode 1: Erstatt filen**

```bash
# Backup den gamle versjonen
mv app/api/chat/bonfire/route.ts app/api/chat/bonfire/route-anthropic.ts.backup

# Kopier den nye Azure-versjonen
cp app/api/chat/bonfire/route-azure.ts app/api/chat/bonfire/route.ts
```

**Metode 2: Manuell redigering**

Åpne `app/api/chat/bonfire/route.ts` og endre:

**Fra (Anthropic):**
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';

// ...

const result = await streamText({
  model: anthropic('claude-3-5-haiku-20241022'),
  // ...
});
```

**Til (Azure OpenAI):**
```typescript
import { createAzure } from '@ai-sdk/azure';
import { streamText, tool } from 'ai';

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_ENDPOINT!.split('//')[1].split('.')[0],
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
});

const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o');

// ...

const result = await streamText({
  model,
  // ... (resten er likt)
});
```

## 🚀 Steg 4: Restart utviklingsserver

```bash
# Stop serveren (Ctrl+C)
npm run dev
```

## 🚀 Steg 5: Test chatboten

Gå til: **http://localhost:3000/bonfire-registration**

Test en komplett samtale og sjekk at:
- ✅ Chatboten svarer på norsk
- ✅ Telefonnummervalidering fungerer
- ✅ Adressevalidering med Google Maps fungerer
- ✅ Bålmelding lagres i database

## 🔍 Verifiser at Azure brukes

Åpne Developer Console (F12) og se etter:
- Network-fanen → `/api/chat/bonfire` → Headers
- Du skal IKKE se "anthropic" i request
- Azure OpenAI bruker standard REST-kall

Eller sjekk terminalen hvor `npm run dev` kjører:
- Ingen feilmeldinger om "ANTHROPIC_API_KEY"

## ⚡ Fordeler med Azure OpenAI

| Feature | Anthropic Claude | Azure OpenAI |
|---------|------------------|--------------|
| **Modell** | Claude 3.5 Haiku | GPT-4o |
| **Språkkvalitet (norsk)** | Utmerket | Utmerket |
| **GDPR-compliance** | EU-servere | EU/Norge-servere |
| **Student-kostnad** | $5 gratis | $100 gratis kredit |
| **Enterprise SLA** | ❌ | ✅ 99.9% uptime |
| **Offentlig sektor** | ⚠️ Krever godkjenning | ✅ Microsoft allerede godkjent |
| **Data residency** | EU | Norge (Sweden Central) |
| **Production-ready** | ✅ | ✅✅ (bedre) |

## 🔄 Bytte tilbake til Anthropic (hvis nødvendig)

Hvis du får problemer med Azure:

```bash
# Restore backup
cp app/api/chat/bonfire/route-anthropic.ts.backup app/api/chat/bonfire/route.ts

# Restart
npm run dev
```

## 🐛 Feilsøking

### "Module not found: @ai-sdk/azure"

```bash
npm install @ai-sdk/azure
```

### "AZURE_OPENAI_API_KEY is not defined"

Sjekk at `.env.local` inneholder riktig nøkkel og restart serveren.

### "Deployment 'gpt-4o' not found"

Gå til Azure Portal og sjekk deployment-navnet. Oppdater `AZURE_OPENAI_DEPLOYMENT` i `.env.local`.

### Chatbot svarer ikke

1. Åpne Developer Console (F12)
2. Se på Network-fanen for feilmeldinger
3. Sjekk at alle Azure environment variables er satt

## ✅ Sjekkliste

- [ ] `npm install @ai-sdk/azure` kjørt
- [ ] Azure environment variables lagt til i `.env.local`
- [ ] `route.ts` oppdatert til å bruke Azure
- [ ] Dev server restartet
- [ ] Chatbot testet og fungerer
- [ ] Database lagring verifisert

## 📚 Neste steg

Når migreringen er ferdig:
1. Test grundig med ulike scenarier
2. Deploy til Vercel (husk å legge til Azure env vars i Vercel)
3. Fjern Anthropic-nøkkel fra `.env.local` hvis ikke lenger nødvendig

---

**Migrering ferdig! Du bruker nå Azure OpenAI GPT-4o! 🎉**
