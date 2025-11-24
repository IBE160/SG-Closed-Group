# Personvernvurdering - Hva Skjer Bålmelding System

**Dato:** 2025-11-20
**Vurdert av:** Claude (AI Assistent)
**Formål:** Vurdere om RBR sin personvernerklæring tillater implementering av det planlagte bålmelding-systemet

---

## Executive Summary

**Konklusjon:** Det planlagte systemet er i tråd med personvernerklæringen, MEN det krever:

1. ✅ **Systemet er en tjeneste forbedring** - ikke en studentoppgave
2. ✅ **Databehandleravtaler** må inngås med Microsoft (Azure) og Google (Maps)
3. ✅ **Formålet er uendret** - fortsatt håndtering av bålmeldinger
4. ⚠️ **Studentoppgaven dokumenterer utviklingsprosessen** - ikke datainnholdet

**Viktig skille:**
- ❌ Bruk av eksisterende bålmeldings-data til studentoppgave = IKKE greit
- ✅ Implementering av nytt system som tjenesteforbedr ing = GREIT

---

## Analyse av Personvernerklæringen

### 1. Formål for Datainnsamling

**Fra personvernerklæringen:**
> "Når du bruker et skjema, vil du oppgi en del data som blir lagret hos oss. Disse opplysningene lagres i våre databaser, dette fordi vi skal kunne respondere på din kontaktforespørsel."

> "Alle personopplysninger vi har samlet har vi samlet for å forstå og forbedre tjenestene og produktene våre"

**Vurdering:**
- ✅ Det planlagte systemet er nettopp for å "forbedre tjenestene"
- ✅ Automatisering gjør at RBR kan "respondere på kontaktforespørsel" raskere og mer effektivt
- ✅ Formålet er uendret: Håndtere bålmeldinger og gi informasjon til operatører

**Konklusjon:** Implementering av systemet er innenfor det oppgitte formålet.

---

### 2. Bruk av Databehandlere (Azure, Google)

**Fra personvernerklæringen:**
> "Dersom Rogaland brann og redning IKS velger et annet selskap som får ansvaret for å behandle personopplysninger, altså data om deg, så kaller vi det en databehandler. I de tilfeller vi benytter databehandlere skal vi sørge for at vi har inngått databehandleravtaler som regulerer hvordan databehandleren kan behandle data som blir tilgjengeliggjort."

> "I noen tilfeller deler vi opplysninger også med samarbeidspartnere som bruker opplysningene til å formidle målrettet innhold og/eller tilbud gjennom sine tjenester. Vi inngår da avtaler som begrenser adgang til bruk av opplysningene og fastsetter forpliktelser til å følge gjeldende personvernlovgivning."

**Planlagte databehandlere:**

| Tjeneste | Formål | Type behandling | Databehandleravtale |
|----------|---------|-----------------|-------------------|
| **Azure OpenAI** | AI-basert ekstraksjon av strukturert data fra e-post | Midlertidig prosessering (ingen lagring) | ✅ Kreves |
| **Google Maps** | Geokoding (adresse → koordinater) + kartvisning | Geokoding API + JavaScript API | ✅ Kreves |
| **Vercel** | Hosting av applikasjon | Database og applikasjonslogikk | ✅ Kreves |
| **Power Automate (Microsoft)** | Overvåking av e-postmapper | Ingen lagring, kun triggering | ✅ Dekket av Azure-avtale |

**Vurdering:**
- ✅ Personvernerklæringen har eksplisitt åpning for bruk av databehandlere
- ✅ Standard praksis i moderne IT-systemer
- ⚠️ RBR må inngå databehandleravtaler med hver leverandør

**Konklusjon:** Bruk av Azure og Google er tillatt, MEN krever formelle databehandleravtaler.

---

### 3. Azure OpenAI - Spesifikke Personvernhensyn

**Fordeler med Azure OpenAI:**
- ✅ **Government-compliant endpoint** (FedRAMP High)
- ✅ **Data residency i EU** (hvis konfigurert)
- ✅ **Ingen treningsdata** - data brukes IKKE til å trene AI-modellen
- ✅ **Automatisk sletting** - data slettes etter prosessering
- ✅ **Kryptering** - både i transitt og hvile

**Konfigurasjons krav:**
```
Azure OpenAI Configuration:
- Endpoint: Norge eller EU region
- Data residency: EU
- Retention policy: 0 days (immediate deletion)
- Training opt-out: Enabled
- Enterprise grade: Yes
```

**Konklusjon:** Azure OpenAI kan brukes trygt med riktig konfigurasjon.

---

### 4. Google Maps - Spesifikke Personvernhensyn

**Google Maps API Bruk:**

| API | Data som sendes | Lagring hos Google | Personvern |
|-----|-----------------|-------------------|-----------|
| **Geocoding API** | Adresse (f.eks. "Storgt. 10, Stavanger") | Midlertidig (request/response) | ✅ Ingen sensitiv data |
| **Maps JavaScript API** | Koordinater (lat/lng) | Ingen | ✅ Anonymisert |
| **Places Autocomplete** | Delvis adresse under skriving | Midlertidig | ✅ Ingen sensitiv data |

**Personvernvurdering:**
- ✅ **Navn og telefon** sendes IKKE til Google
- ✅ **Kun adresse** brukes for geokoding
- ✅ **Adresser er offentlige** (ikke sensitive personopplysninger)
- ✅ **API-nøkkel** begrenset til spesifikke domener

**Konklusjon:** Google Maps-bruk er personvernmessig forsvarlig.

---

### 5. Studentoppgaven vs. Tjenesteimplementering

Dette er det kritiske skillet:

#### ❌ Studentoppgave med eksisterende data (IKKE greit)

**Scenario:** Student får tilgang til eksisterende bålmeldings-data for å analysere i skoleoppgave.

**Hvorfor ikke greit:**
- Formålet endres fra "håndtering av bålmeldinger" til "utdanning/forskning"
- Innbyggerne samtykket IKKE til bruk i studentoppgaver
- Krever nytt samtykke eller anonymisering
- Juridisk vurdering: **NEI**

---

#### ✅ Tjenesteimplementering dokumentert i studentoppgave (GREIT)

**Scenario:** Student utvikler et system for RBR som forbedrer tjenesten. Studentoppgaven dokumenterer utviklingsprosessen.

**Hvorfor greit:**
- Formålet er uendret: "forbedre tjenestene og produktene våre"
- Innbyggerne får bedre tjeneste (raskere respons, bedre kartvisning)
- Studentoppgaven dokumenterer PROSESSEN, ikke datainnholdet
- Systemet blir produksjons-klar og overtatt av RBR
- Juridisk vurdering: **JA (med databehandleravtaler)**

**Eksempel på studentoppgave-innhold:**
```
✅ GREIT:
- "Jeg utviklet et system som automatiserer bålmeldings-prosessen"
- "Systemet bruker Azure OpenAI for å ekstraktere strukturert data"
- "Jeg implementerte en kartvisning med Google Maps"
- "Systemet reduserer behandlingstid fra 5 minutter til 10 sekunder"

❌ IKKE GREIT:
- "Her er en liste over alle bålmeldingene vi mottok"
- "Jeg analyserte dataene og fant at..."
- "Navnene på innbyggerne som sendte inn var..."
```

**Konklusjon:** Implementering dokumentert i studentoppgave er greit, så lenge rapporten fokuserer på prosess og teknologi, ikke datainnhold.

---

## Juridiske Vurderinger

### GDPR Artikkel 6 - Rettslig grunnlag

**Relevant grunnlag for behandling:**

1. **Art. 6(1)(c) - Rettslig forpliktelse**
   - RBR har plikt til å håndtere bålmeldinger (brannsikkerhet)
   - ✅ Systemet oppfyller denne plikten mer effektivt

2. **Art. 6(1)(e) - Offentlig oppgave**
   - RBR utfører offentlig oppgave (nødetatstjenester)
   - ✅ Systemet støtter denne oppgaven

3. **Art. 6(1)(f) - Legitim interesse**
   - RBR har legitim interesse i effektive systemer
   - ✅ Innbyggernes interesser ivaretas (raskere respons)

**Konklusjon:** Behandlingen har solid rettslig grunnlag.

---

### GDPR Artikkel 5 - Behandlingsprinsip per

**Krav:** Personopplysninger skal behandles:

| Prinsipp | Krav | Vurdering |
|----------|------|-----------|
| **Lovlighet** | Rettslig grunnlag | ✅ Art. 6(1)(c) og (e) |
| **Formålsbegrensning** | Data brukes til oppgitt formål | ✅ Uendret formål |
| **Dataminimering** | Kun nødvendige data samles | ✅ Samme data som før |
| **Riktighet** | Data skal være korrekte | ✅ AI validerer data |
| **Lagrings begrensning** | Slettes når ikke lenger nødvendig | ✅ 90 dager (som planlagt) |
| **Integritet og konfidensialitet** | Sikkerhet | ✅ Kryptering, tilgangskontroll |
| **Ansvarlighet** | Påvise etterlevelse | ✅ Audit logging |

**Konklusjon:** Alle GDPR-prinsipper overholdes.

---

### GDPR Artikkel 28 - Databehandleravtaler

**Krav til databehandleravtaler:**

RBR må ha skriftlige avtaler med alle databehandlere som regulerer:

1. ✅ **Behandlingens art, formål, varighet**
   - Avtale spesifiserer nøyaktig hva databehandleren gjør

2. ✅ **Type personopplysninger**
   - Navn, telefon, adresse, dato/tid

3. ✅ **Kategorier registrerte**
   - Innbyggere som melder inn bål

4. ✅ **Rettigheter og plikter**
   - Databehandler må følge RBRs instruksjoner
   - Databehandler må sikre konfidensialitet
   - Databehandler må varsle om sikkerhetsbrudd

5. ✅ **Underbehandlere**
   - Databehandler må få godkjenning for underbehandlere

6. ✅ **Sletting av data**
   - Data slettes når samarbeidet avsluttes

**Konklusjon:** RBR må inngå formelle databehandleravtaler.

---

## Anbefalinger

### 1. Juridisk Dokumentasjon (Kritisk)

**Før implementering:**

- [ ] **Databehandleravtale med Microsoft (Azure OpenAI)**
  - Template: https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA
  - Spesifiser: Azure OpenAI, EU data residency, 0-day retention

- [ ] **Databehandleravtale med Google (Maps API)**
  - Template: https://privacy.google.com/businesses/processorterms/
  - Spesifiser: Geocoding API, Maps JavaScript API, Places API

- [ ] **Databehandleravtale med Vercel (Hosting)**
  - Template: https://vercel.com/legal/dpa
  - Spesifiser: Vercel Postgres, serverless functions, EU hosting

- [ ] **Internt notat: Formålsvurdering**
  - Dokumenter at systemet er en tjenesteforbedr ing
  - Referanse til personvernerklæringen § "forbedre tjenestene"

---

### 2. Oppdatering av Personvernerklæringen (Anbefalt)

**Forslag til tillegg:**

> **Automatisk behandling av bålmeldinger**
>
> For å gi raskere og bedre service bruker vi automatiske systemer for å behandle bålmeldinger. Når du sender inn en bålmelding via e-post, vil informasjonen bli prosessert automatisk ved hjelp av kunstig intelligens (AI) for å strukturere dataene og vise bållokasjonen på et kart.
>
> Vi bruker følgende databehandlere:
> - **Microsoft Azure** - for automatisk lesing og strukturering av e-post
> - **Google Maps** - for å vise bållokasjonen på kart
> - **Vercel** - for hosting av systemet
>
> Alle databehandlere har databehandleravtaler som sikrer at dine personopplysninger behandles i henhold til personvernlovgivningen.
>
> Informasjonen slettes automatisk 90 dager etter at bålperioden er over.

---

### 3. Studentoppgaven (Viktig)

**Retningslinjer for studentrapporten:**

✅ **GREIT å inkludere:**
- Systembeskrivelse og arkitektur
- Teknologivalg og begrunnelser
- Utviklingsprosess og utfordringer
- Kodeeksempler (uten reelle data)
- Anonymisert statistikk (f.eks. "systemet behandler gjennomsnittlig 50 meldinger per dag")
- Skjermbilder med testdata/fiktive data

❌ **IKKE inkluder:**
- Navn, telefonnumre, eller adresser fra reelle bålmeldinger
- Skjermbilder med reelle personopplysninger
- Statistikk som kan identifisere enkeltpersoner
- Direkte sitater fra e-postmeldinger

**Eksempel på anonymisering:**
```
❌ IKKE SÅ HER:
"Ola Nordmann (95123456) meldte inn bål på Storgt. 10 i Stavanger"

✅ SÅ HER:
"En innbygger meldte inn bål på en adresse i Stavanger sentrum"
```

---

### 4. Teknisk Implementering

**Sikkerhetstiltak som må implementeres:**

- [ ] **Kryptering**
  - SSL/TLS for all kommunikasjon (automatisk via Vercel)
  - Database-kryptering (Vercel Postgres har dette)

- [ ] **Tilgangskontroll**
  - Google OAuth autentisering
  - Whitelist for operatører
  - Rolle-basert tilgang (operator/admin)

- [ ] **Audit logging**
  - Logg alle API-kall til Azure OpenAI
  - Logg alle endringer i bålmeldinger
  - Logg hvem som så/endret hva

- [ ] **Data retention**
  - Automatisk sletting etter 90 dager
  - Cron job for cleanup

- [ ] **Azure OpenAI konfigurasjon**
  - EU data residency
  - 0-day retention policy
  - Disable training on customer data

- [ ] **Google Maps API sikkerhet**
  - API-nøkkel restricted til spesifikke domener
  - Ingen sensitiv data i API-kall (kun adresser)

---

## Konklusjon og Neste Steg

### Oppsummering

**Hovedkonklusjon:** Det planlagte Hva Skjer bålmelding-systemet er i tråd med RBRs personvernerklæring, forutsatt at:

1. ✅ **Formålet er tjenesteforbedr ing** (ikke studentoppgave)
2. ✅ **Databehandleravtaler inngås** (Microsoft, Google, Vercel)
3. ✅ **Sikkerhetstiltak implementeres** (som beskrevet)
4. ✅ **Studentrapporten anonymiseres** (ingen reelle personopplysninger)

---

### Neste Steg for Godkjenning

**For Rune (Student):**

1. **Ta kontakt med nærmeste leder** (som anbefalt i e-posten)
   - Presenter denne analysen
   - Forklar skillet mellom "studentoppgave" og "tjenesteimplementering"
   - Be om skriftlig godkjenning for å utvikle systemet

2. **Klargjør rollene:**
   - Student utvikler systemet FOR RBR
   - RBR er databehandlingsansvarlig
   - Systemet overtakes av RBR etter ferdigstilling
   - Studentrapporten dokumenterer prosessen (ikke dataene)

**For RBR Ledelse:**

1. **Juridisk avklaring:**
   - Vurder om systemet er innenfor "forbedre tjenestene" (vår vurdering: JA)
   - Gi skriftlig godkjenning til Rune for systemutvikling

2. **Databehandleravtaler:**
   - Inngå avtaler med Microsoft, Google, Vercel
   - Dette kan gjøres parallelt med utviklingen

3. **Oppdater personvernerklæringen:**
   - Legg til seksjon om automatisk behandling (valgfritt men anbefalt)
   - Publiser oppdatert versjon på nettsiden

---

### Tidsplan (Forslag)

| Uke | Aktivitet | Ansvarlig |
|-----|-----------|-----------|
| **Uke 1** | Juridisk vurdering og godkjenning | RBR Ledelse |
| **Uke 1-2** | Databehandleravtaler (kan starte tidlig) | RBR IT/Juridisk |
| **Uke 2-6** | Systemutvikling (kan starte etter godkjenning) | Rune |
| **Uke 6** | Testing med testdata | Rune + RBR |
| **Uke 7** | Testing med reelle data (pilot) | RBR Operatører |
| **Uke 8** | Produksjonssetting | RBR IT |
| **Uke 9-10** | Studentrapport (anonymisert) | Rune |

---

## Vedlegg: Relevante Lover og Forskrifter

**GDPR (Personvernforordningen):**
- Artikkel 5: Behandlingsprinsipper
- Artikkel 6: Rettslig grunnlag
- Artikkel 28: Databehandleravtaler
- Artikkel 32: Sikkerhet ved behandling

**Personopplysningsloven:**
- § 3: Formål
- § 4: Virkeområde
- § 6: Ansvarlighet

**Brann- og eksplosjonsvernloven:**
- § 7: Bruk av åpen ild utendørs (hjemmel for bålmeldingsordningen)

---

**Dokumentet er utarbeidet av:** Claude (AI Assistent)
**Juridisk vurdering:** Dette er en teknisk analyse og juridisk veiledning. For endelig juridisk vurdering, konsulter RBRs juridiske fagleder eller ekstern advokat.

