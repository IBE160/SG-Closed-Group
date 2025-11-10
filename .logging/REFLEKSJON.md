# Guide: Bruke AI-logger til Refleksjonsoppgaven

Denne guiden viser deg hvordan du kan bruke loggverktøyene for å hente ut data til din refleksjonsoppgave.

## 🎯 Hva kan du se?

Med disse verktøyene kan du:

- ✅ **Se alle dine samtaler med Claude og Gemini**
- ✅ **Lese alle prompts du har sendt**
- ✅ **Se alle svar fra AI-assistentene**
- ✅ **Følge tankeprosessene (thinking blocks)**
- ✅ **Se hvilke verktøy som ble brukt**
- ✅ **Token-forbruk og statistikk**
- ✅ **Timestamps for alle interaksjoner**

## 📋 Steg-for-steg Instruksjoner

### 1. Prosesser Claude Code Logger

Dette er den viktigste kommandoen - den henter ut alle dine Claude-samtaler:

```bash
cd /home/user/SG-Closed-Group
python .logging/process-claude-logs.py --all
```

Du vil se noe som dette:
```
🔍 Søker etter Claude Code logger...
✅ Fant 4 logger
📝 Prosesserer alle 4 sesjoner...

🔄 Prosesserer: fa8685b0-1c85-45d8-9939-5f461bae8291.jsonl
   ✅ Lagret: 2025-11-10_10-04-25-fa8685b0.json
   📊 31 interaksjoner

✨ Ferdig! Prosesserte 4 sesjoner
```

### 2. Åpne Vieweren

Start den lokale web-serveren:

```bash
python .logging/server.py
```

Dette vil åpne nettleseren din automatisk på `http://localhost:8000/api-viewer.html`

### 3. Naviger i Vieweren

**Venstre sidebar:**
- Liste over alle dine sesjoner
- Klikk på en sesjon for å se den

**Hovedområde:**
- 🟦 Blå kort = Dine prompts/spørsmål
- 🟩 Grønne kort = Claude's svar
- 💭 Tankeprosesser (thinking blocks) vises i svarene

**For hver melding:**
- 📋 Kopier-knapp (øverst til høyre) - kopier hele meldingen
- Dobbelt-klikk på lange meldinger for å utvide/kollapse

### 4. Eksporter Data til Refleksjonsoppgaven

**Metode 1: Kopier fra vieweren**
1. Åpne en interessant samtale
2. Klikk 📋 for å kopiere spesifikke meldinger
3. Lim inn i dokumentet ditt

**Metode 2: Bruk JSON-filene direkte**

Alle prosesserte logger ligger i `.logging/requests/`:

```bash
ls -lh .logging/requests/
```

Du kan åpne disse JSON-filene i en teksteditor og hente ut relevant data.

**Metode 3: Python-script for analyse**

Lag et enkelt Python-script for å trekke ut statistikk:

```python
import json
from pathlib import Path

# Les alle sessions
request_files = Path('.logging/requests').glob('*.json')

total_interactions = 0
total_prompts = 0

for file in request_files:
    with open(file) as f:
        data = json.load(f)
        total_interactions += len(data)

        for interaction in data:
            request = interaction.get('request', {})
            request_text = request.get('request_text', [])

            # Tell prompts
            if request_text:
                total_prompts += 1

                # Print første prompt i hver sesjon
                if total_prompts == 1:
                    user_parts = request_text[0].get('parts', [])
                    if user_parts:
                        print(f"Session: {file.name}")
                        print(f"Første prompt: {user_parts[0].get('text', '')[:100]}...")
                        print()

print(f"Totalt: {total_interactions} interaksjoner, {total_prompts} prompts")
```

Kjør scriptet:
```bash
python mitt_analyse_script.py
```

## 📊 Nyttig Informasjon for Refleksjonen

### Hva loggene inneholder:

1. **Prompts (dine spørsmål)**
   - Eksakte ordlyd
   - Tidspunkt
   - Kontekst

2. **Svar fra AI**
   - Full respons
   - Tankeprosesser
   - Verktøybruk

3. **Metadata**
   - Session IDs
   - Timestamps
   - Token counts
   - Response times

### Spørsmål du kan svare på med loggene:

- Hvilke typer spørsmål stilte jeg?
- Hvordan formulerte jeg problemene mine?
- Hvilke strategier brukte AI-assistenten?
- Hvor mange iterasjoner trengte jeg?
- Hva lærte jeg underveis?
- Hvordan utviklet samtalene seg?

## 🔐 Personvern

- ✅ Alle logger er **lokale** på din maskin
- ✅ Ingen data sendes til foreleser automatisk
- ✅ Du kontrollerer hva du deler i refleksjonsoppgaven
- ⚠️ **Pass på å ikke inkludere sensitive data** i refleksjonen

## 💡 Tips

1. **Kjør prosesseringen jevnlig** for å fange opp nye sesjoner:
   ```bash
   python .logging/process-claude-logs.py --all
   ```

2. **Sorter sesjoner kronologisk** for å se utviklingen over tid

3. **Bruk søk i nettleseren** (Ctrl+F / Cmd+F) i vieweren for å finne spesifikke topics

4. **Eksporter screenshots** av interessante samtaler for refleksjonsoppgaven

## 🆘 Feilsøking

### Problem: "Ingen logger funnet"

**Løsning:** Sjekk at du har brukt Claude Code først. Logger lagres i:
```bash
ls ~/.claude/projects/*/*.jsonl
```

### Problem: "Vieweren viser ingen data"

**Løsning:**
1. Sjekk at du kjørte prosesseringen først
2. Verifiser at filer eksisterer:
   ```bash
   ls -lh .logging/requests/
   ```

### Problem: "Server starter ikke"

**Løsning:**
1. Sjekk at port 8000 er ledig
2. Prøv en annen port:
   ```bash
   python .logging/server.py 9000
   ```

## 📚 Ytterligere Ressurser

- Se `.logging/README.md` for full dokumentasjon
- Se `.logging/telemetry.md` for Gemini-spesifikk telemetri
- Kontakt foreleser hvis du trenger hjelp

---

**Lykke til med refleksjonsoppgaven! 🎓**
