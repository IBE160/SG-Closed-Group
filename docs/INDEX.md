# SG-Closed-Group Dokumentasjonsindex

Operasjonelt dashboard for nødvarslingsoperatører i Vestfold.

---

## Kjernedokumenter

| Dokument | Beskrivelse |
|----------|-------------|
| [PRD.md](PRD.md) | Product Requirements Document |
| [architecture.md](architecture.md) | Teknisk arkitektur og beslutninger |
| [epics.md](epics.md) | Epic-oversikt og stories |
| [sprint-status.yaml](sprint-status.yaml) | Nåværende prosjektstatus |

---

## Tech Specs (per Epic)

| Epic | Tech Spec |
|------|-----------|
| Epic 1: Foundation | [tech-spec-epic-1.md](tech-spec-epic-1.md) |
| Epic 2: Auth | [tech-spec-epic-2.md](tech-spec-epic-2.md) |
| Epic 3: Dashboard | [tech-spec-epic-3.md](tech-spec-epic-3.md) |
| Epic 4: Flash | [tech-spec-epic-4.md](tech-spec-epic-4.md) |

---

## Retrospektiver

| Epic | Retro | Dato |
|------|-------|------|
| Epic 1 | [epic-1-retro-2025-11-23.md](sprint-artifacts/epic-1-retro-2025-11-23.md) | 2025-11-23 |
| Epic 2 | [epic-2-retro-2025-12-02.md](sprint-artifacts/epic-2-retro-2025-12-02.md) | 2025-12-02 |
| Epic 3 | [epic-3-retro-2025-12-02.md](sprint-artifacts/epic-3-retro-2025-12-02.md) | 2025-12-02 |
| Epic 4 | [epic-4-retro-2025-12-02.md](sprint-artifacts/epic-4-retro-2025-12-02.md) | 2025-12-02 |
| Epic 5 | [epic-5-retro-2025-11-27.md](sprint-artifacts/epic-5-retro-2025-11-27.md) | 2025-11-27 |

---

## Stories (per Epic)

### Epic 1: Foundation & Infrastructure (8 stories)
| # | Story | Status |
|---|-------|--------|
| 1-1 | [Project Initialization](stories/1-1-project-initialization-and-repository-setup.md) | Done |
| 1-2 | [Database Schema](stories/1-2-database-schema-design-and-prisma-setup.md) | Done |
| 1-3 | [Tailwind & shadcn/ui](stories/1-3-tailwind-css-and-shadcn-ui-component-library-setup.md) | Done |
| 1-4 | [Folder Navigation](stories/1-4-folder-tab-navigation-structure.md) | Done |
| 1-5 | [Hva Skjer Layout](stories/1-5-hva-skjer-folder-layout-structure.md) | Done |
| 1-6 | [Vercel Deploy](stories/1-6-vercel-deployment-pipeline-configuration.md) | Done |
| 1-7 | [SSE Infrastructure](stories/1-7-real-time-infrastructure-foundation-sse-websocket-setup.md) | Done |
| 1-8 | [Audit Logging](stories/1-8-audit-logging-infrastructure.md) | Done |

### Epic 2: Authentication & Access Control (6 stories)
| # | Story | Status |
|---|-------|--------|
| 2-1 | [NextAuth.js Google OAuth](stories/2-1-nextauth-js-configuration-with-google-oauth.md) | Done |
| 2-2 | [User Whitelist Management](stories/2-2-user-whitelist-management-system.md) | Done |
| 2-3 | [Role-Based Access Control](stories/2-3-role-based-access-control-rbac-implementation.md) | Done |
| 2-4 | [Protected Routes & API](stories/2-4-protected-routes-and-api-endpoints.md) | Done |
| 2-5 | [Login Page & Profile UI](stories/2-5-login-page-and-user-profile-ui.md) | Done |
| 2-6 | [Session Security](stories/2-6-session-management-and-security-hardening.md) | Done |

### Epic 3: Event Control Dashboard (8 stories)
| # | Story | Status |
|---|-------|--------|
| 3-1 | [Event Create/List](stories/3-1-event-management-create-and-list-events.md) | Done |
| 3-2 | [Event Edit/Delete](stories/3-2-event-management-edit-and-delete-events.md) | Done |
| 3-3 | [Priority System](stories/3-3-priority-system-and-filtering.md) | Done |
| 3-4 | [Bilstatus Display](stories/3-4-bilstatus-vehicle-rotation-status-display-and-toggle.md) | Done |
| 3-5 | [Bilstatus Grey](stories/3-5-bilstatus-grey-status-with-notes.md) | Done |
| 3-6 | [Vaktplan Display](stories/3-6-vaktplan-duty-roster-display.md) | Done |
| 3-7 | [Vaktplan Admin](stories/3-7-vaktplan-administrator-editing.md) | Done |
| 3-8 | [Talegrupper](stories/3-8-talegrupper-radio-talk-groups.md) | Done |

### Epic 4: Flash Message System (6 stories)
| # | Story | Status |
|---|-------|--------|
| 4-1 | [Flash Send/Receive](stories/4-1-flash-message-basic-send-and-receive.md) | Done |
| 4-2 | [Blink & Acknowledge](stories/4-2-blink-animation-and-acknowledgment.md) | Done |
| 4-3 | [Smart Typing Detection](stories/4-3-smart-typing-detection-and-auto-switch.md) | Skipped |
| 4-4 | [Message History](stories/4-4-message-history-and-multiple-messages.md) | Done |
| 4-5 | [Auto-Return Timer](stories/4-5-auto-return-timer-and-flash-folder-ui.md) | Skipped |
| 4-6 | [Performance Optimization](stories/4-6-flash-message-performance-optimization.md) | Done |

### Epic 5: Balmelding (Bonfire) System (7 stories)
| # | Story | Status |
|---|-------|--------|
| 5-1 | [Google Maps Integration](stories/5-1-google-maps-integration-and-map-display.md) | Done |
| 5-2 | [Manual Bonfire Registration](stories/5-2-manual-bonfire-registration-baseline.md) | Done |
| 5-3 | [Azure OpenAI Email Parsing](stories/5-3-azure-openai-email-parsing-phase-1.md) | Done |
| 5-4 | [Power Automate Integration](stories/5-4-power-automate-integration-phase-2.md) | Done |
| 5-5 | [Municipality Filtering](stories/5-5-municipality-filtering-and-search.md) | Done |
| 5-6 | [Automatic Expiration](stories/5-6-automatic-bonfire-expiration.md) | Done |
| 5-7 | [Manual Review Queue](stories/5-7-manual-review-queue-for-flagged-registrations.md) | Done |

---

## Prosjektstatistikk

| Kategori | Antall |
|----------|--------|
| **Totalt stories** | 35 |
| **Fullført** | 33 |
| **Hoppet over** | 2 |
| **Epics** | 5 |
| **Retrospektiver** | 5 |

---

## Planlegging & Research

| Dokument | Beskrivelse |
|----------|-------------|
| [product-brief-hva-skjer-2025-11-10.md](product-brief-hva-skjer-2025-11-10.md) | Produktkonsept |
| [brainstorming-session-results-2025-11-01.md](brainstorming-session-results-2025-11-01.md) | Idedugnad |
| [architecture-session-log-2025-11-13.md](architecture-session-log-2025-11-13.md) | Arkitektursesjonslogg |
| [ux-design-specification.md](ux-design-specification.md) | UX-spesifikasjon |
| [technical-research-2025-11-18.md](technical-research-2025-11-18.md) | Teknisk research |
| [privacy-analysis.md](privacy-analysis.md) | Personvernanalyse |
| [project-plan.md](project-plan.md) | Prosjektplan |
| [project-tech-overview.md](project-tech-overview.md) | Teknisk oversikt |

---

## Mappestruktur

```
docs/
├── INDEX.md              # Denne filen
├── PRD.md                # Produktkrav
├── architecture.md       # Arkitektur
├── epics.md              # Epic-oversikt
├── sprint-status.yaml    # Status-tracking
├── tech-spec-epic-*.md   # Tech specs
├── stories/              # Alle story-filer (35 totalt)
│   ├── 1-*.md           # Epic 1: 8 stories
│   ├── 2-*.md           # Epic 2: 6 stories
│   ├── 3-*.md           # Epic 3: 8 stories
│   ├── 4-*.md           # Epic 4: 6 stories
│   └── 5-*.md           # Epic 5: 7 stories
└── sprint-artifacts/     # Retrospektiver
    └── epic-*-retro-*.md
```

---

*Oppdatert: 2025-12-03*
