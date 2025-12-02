# Epic Technical Specification: Foundation & Infrastructure

Date: 2025-11-16
Author: BIP
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 establishes the complete technical foundation for the Hva Skjer emergency response application. This epic creates the base architecture, development environment, database schema, UI framework, deployment pipeline, real-time infrastructure, and audit logging system that all subsequent features depend on. The foundation must support 24/7 emergency operations with 4-6 concurrent dispatchers, prioritizing sub-second real-time communication and zero-downtime reliability.

This epic transforms an empty repository into a production-ready application skeleton with Next.js 14, TypeScript, PostgreSQL, and all core infrastructure operational. By the end of this epic, the application will be deployed to Vercel with continuous deployment, have a complete database schema, display a functional multi-tab navigation interface, support real-time synchronization via SSE, and automatically log all user actions for compliance.

## Objectives and Scope

### In Scope

- Next.js 14 project initialization with TypeScript, Tailwind CSS, and ESLint
- Complete database schema design covering all features (8 tables)
- Prisma ORM configuration with migrations
- shadcn/ui component library setup with emergency services theme
- Four-tab folder navigation structure (Hva Skjer, Flash, Bålmelding, Innstillinger)
- "Hva Skjer" folder layout with three distinct sections
- Vercel deployment pipeline with continuous deployment
- Real-time infrastructure using Server-Sent Events (SSE)
- Audit logging infrastructure with Prisma middleware
- Environment variable configuration for all external services
- Git repository with proper .gitignore and README

### Out of Scope

- Authentication implementation (Epic 2)
- Feature-specific business logic (Epics 3, 4, 5)
- Data population or seeding (handled per-feature)
- Production domain configuration (development/preview only)
- Performance optimization beyond architectural decisions
- Monitoring and alerting setup (basic Vercel logs only)

## System Architecture Alignment

This epic implements the foundational layer of the architecture as defined in architecture.md:

**Framework & Runtime:**
- Next.js 14 with App Router (server components, route handlers)
- Node.js 22.x or 24.x LTS runtime
- TypeScript 5.x for type safety across all code

**Data Layer:**
- PostgreSQL via Vercel Postgres (free tier sufficient for 4-6 users)
- Prisma ORM 6.x with type-safe queries
- 8 core tables: User, Event, FlashMessage, VehicleStatus, DutyRoster, BonfireRegistration, AuditLog, Session

**UI Layer:**
- Tailwind CSS 3.x utility-first styling
- shadcn/ui component library (Radix UI primitives)
- Custom emergency services theme (blues, greys, emergency red)
- Responsive design for 1/4 of 49" monitor viewport (~1280x1440 or 2560x720)

**Real-Time Communication:**
- Server-Sent Events (SSE) for one-way broadcasts
- `/api/sse` route handler with connection management
- React Context for client-side connection state
- Fallback to polling (5-second interval) on SSE failure

**Deployment:**
- Vercel platform with continuous deployment
- Automatic HTTPS and SSL
- Environment variable management
- Preview deployments for branches, production for main

**Key Architectural Constraints Met:**
- Zero integration with Locus Emergency Operation System (operates independently)
- Government-grade security preparation (audit trails, GDPR-ready data models)
- Emergency-first UX (Excel-style tabs, minimal clicks, < 200ms navigation)
- Scalable for 4-6 concurrent users with room for growth

---

## Detailed Design

### Services and Modules

| Module/Service | Responsibilities | Inputs | Outputs | Owner |
|----------------|------------------|--------|---------|-------|
| **Next.js App** | Main application framework, routing, server components | HTTP requests, API calls | Rendered UI, API responses | Story 1.1 |
| **Prisma Client** | Database ORM, type-safe queries, migrations | Model definitions, queries | Query results, type safety | Story 1.2 |
| **Database (PostgreSQL)** | Persistent data storage, relational integrity | SQL via Prisma | Query results | Story 1.2 |
| **Tab Navigation** | Route management, active tab state | User clicks, URL state | Rendered tabs, route navigation | Story 1.4 |
| **Layout System** | Grid-based responsive layout for "Hva Skjer" | Component composition | Three-section layout | Story 1.5 |
| **SSE Manager** | Real-time event broadcasting | Client connections, events | Server-Sent Events stream | Story 1.7 |
| **Audit Logger** | Automatic action logging via Prisma middleware | Database mutations | AuditLog records | Story 1.8 |
| **Vercel Platform** | Hosting, CD/CI, serverless functions | Git pushes | Deployed application | Story 1.6 |

### Data Models and Contracts

**Complete Schema (Prisma):**

```prisma
// User Model - Authentication and RBAC
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  whitelisted   Boolean   @default(false)
  role          Role      @default(OPERATOR)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]

  @@index([email])
}

enum Role {
  OPERATOR
  ADMINISTRATOR
}

// Session Model - NextAuth.js JWT sessions
model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires      DateTime
  sessionToken String   @unique
  accessToken  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
}

// Event Model - Operational events (Epic 3)
model Event {
  id          String      @id @default(uuid())
  title       String      @db.VarChar(50)
  description String      @db.VarChar(200)
  priority    Priority    @default(NORMAL)
  status      EventStatus @default(ACTIVE)
  createdBy   String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?
  deletedBy   String?

  @@index([priority, createdAt])
  @@index([status])
}

enum Priority {
  CRITICAL  // Pri 1 (Red)
  NORMAL
}

enum EventStatus {
  ACTIVE
  RESOLVED
  ARCHIVED
}

// FlashMessage Model - Urgent dispatcher communication (Epic 4)
model FlashMessage {
  id          String   @id @default(uuid())
  content     String   @db.VarChar(100)
  createdBy   String
  createdAt   DateTime @default(now())
  expiresAt   DateTime // Auto-archive after 24 hours

  @@index([createdAt])
}

// VehicleStatus Model - Truck rotation (S111, S112) (Epic 3)
model VehicleStatus {
  id          String         @id @default(uuid())
  vehicleId   String         @unique // "S111" or "S112"
  status      VehicleStatus  @default(OUT)
  note        String?        @db.VarChar(50) // Grey status reason
  updatedBy   String
  updatedAt   DateTime       @updatedAt

  @@index([vehicleId])
}

enum VehicleStatusType {
  READY           // Green - available
  OUT             // Red - just responded
  OUT_OF_SERVICE  // Grey - maintenance/training
}

// DutyRoster Model - Weekly personnel assignments (Epic 3)
model DutyRoster {
  id         String   @id @default(uuid())
  weekNumber Int      // ISO week number
  year       Int
  position   String   @db.VarChar(100) // "vakthavende brannsjef", etc.
  assignedTo String   @db.VarChar(100) // Person name
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([weekNumber, year, position])
  @@index([weekNumber, year])
}

// BonfireRegistration Model - Bonfire notifications (Epic 5)
model BonfireRegistration {
  id           String              @id @default(uuid())
  registrantName   String          @db.VarChar(100)
  phone        String              @db.VarChar(20)
  address      String              @db.VarChar(200)
  municipality String              @db.VarChar(50)
  lat          Float
  lng          Float
  bonfireSize  String              @db.VarChar(50) // "Small", "Medium", "Large"
  dateFrom     DateTime
  dateTo       DateTime
  notes        String?             @db.Text
  status       BonfireStatus       @default(ACTIVE)
  source       BonfireSource       @default(MANUAL)
  confidence   Float?              // AI extraction confidence (0-1)
  rawEmail     String?             @db.Text // Original email for audit
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt
  expiresAt    DateTime            // Auto-set to dateTo
  deletedAt    DateTime?           // GDPR: soft delete after 90 days

  @@index([municipality, dateFrom])
  @@index([status, expiresAt])
  @@index([lat, lng])
}

enum BonfireStatus {
  ACTIVE
  EXPIRED
  FLAGGED_FOR_REVIEW
}

enum BonfireSource {
  MANUAL         // Phase 1: Manual entry
  AI_APPROVED    // Phase 2: AI auto-created
  AI_REVIEWED    // Phase 2: AI flagged, human approved
}

// AuditLog Model - Complete action history for compliance
model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  userEmail  String
  timestamp  DateTime @default(now())
  tableName  String   @db.VarChar(50)
  recordId   String   @db.VarChar(100)
  actionType String   @db.VarChar(20) // CREATE, UPDATE, DELETE
  oldValues  Json?    // JSONB snapshot
  newValues  Json?    // JSONB snapshot

  @@index([timestamp(sort: Desc)])
  @@index([tableName])
  @@index([userId])
}
```

**Key Design Decisions:**
- UUID primary keys for security (non-sequential, unpredictable)
- Composite indexes for frequently queried combinations (municipality + date + status)
- JSONB fields for audit snapshots (flexible, queryable)
- Soft deletes with `deletedAt` timestamps (GDPR compliance)
- VARCHAR length constraints based on real-world maximums (email = 100 chars, phone = 20 chars)
- Timestamps: `createdAt`, `updatedAt` on all tables for audit trail

### APIs and Interfaces

**API Route Structure (Next.js App Router):**

| Endpoint | Method | Purpose | Request | Response | Epic |
|----------|--------|---------|---------|----------|------|
| `/api/sse` | GET | Real-time event stream | - | SSE stream | 1.7 |
| `/api/health` | GET | Health check | - | `{ status: "ok" }` | 1.1 |
| `/api/auth/[...nextauth]` | ALL | NextAuth.js handlers | Varies | Auth responses | Epic 2 |
| `/api/events` | GET | List events | Query params | `Event[]` | Epic 3 |
| `/api/events` | POST | Create event | `{ title, description, priority }` | `Event` | Epic 3 |
| `/api/events/[id]` | PATCH | Update event | `{ title?, description?, status? }` | `Event` | Epic 3 |
| `/api/events/[id]` | DELETE | Soft delete event | - | `{ success: true }` | Epic 3 |
| `/api/flash` | POST | Send flash message | `{ content }` | `FlashMessage` | Epic 4 |
| `/api/bilstatus` | GET | Get vehicle status | - | `VehicleStatus[]` | Epic 3 |
| `/api/bilstatus` | PATCH | Toggle truck status | `{ vehicleId, status, note? }` | `VehicleStatus` | Epic 3 |
| `/api/vaktplan` | GET | Get duty roster | `?week&year` | `DutyRoster[]` | Epic 3 |
| `/api/vaktplan` | POST | Update roster | `DutyRoster[]` | `DutyRoster[]` | Epic 3 |
| `/api/bonfires` | GET | List bonfires | `?municipality` | `BonfireRegistration[]` | Epic 5 |
| `/api/bonfires` | POST | Create bonfire | `{ name, phone, address, ... }` | `BonfireRegistration` | Epic 5 |
| `/api/bonfires/extract` | POST | AI extraction | `{ emailBody }` | `{ extracted: {}, confidence }` | Epic 5 |

**SSE Event Types (Real-Time):**

```typescript
type SSEEvent =
  | { type: 'EVENT_CREATED'; payload: Event }
  | { type: 'EVENT_UPDATED'; payload: Event }
  | { type: 'EVENT_DELETED'; payload: { id: string } }
  | { type: 'FLASH_MESSAGE'; payload: FlashMessage }
  | { type: 'BILSTATUS_UPDATED'; payload: VehicleStatus[] }
  | { type: 'BONFIRE_CREATED'; payload: BonfireRegistration }
  | { type: 'BONFIRE_EXPIRED'; payload: { id: string } };
```

**Error Response Format:**

```typescript
{
  error: string;       // Human-readable message
  code: string;        // Machine-readable code (e.g., "UNAUTHORIZED")
  status: number;      // HTTP status code
  timestamp: string;   // ISO 8601 timestamp
}
```

### Workflows and Sequencing

**Story Execution Sequence:**

```
Story 1.1 (Project Init)
    ↓
    ├─→ Story 1.2 (Database Schema) ──→ Story 1.6 (Vercel Deployment)
    │                                           ↓
    ├─→ Story 1.3 (Tailwind/shadcn) ──→ Story 1.4 (Navigation)
    │                                           ↓
    │                                   Story 1.5 (Layout)
    │                                           ↓
    └─→ Story 1.7 (Real-Time SSE) ──────────────┘
                                                ↓
                                        Story 1.8 (Audit Logging)
```

**Real-Time Broadcast Flow:**

```
1. User Action (e.g., create flash message)
    ↓
2. API Route Handler receives POST request
    ↓
3. Validate request (auth, input validation)
    ↓
4. Execute business logic + Prisma mutation
    ↓
5. Audit Logger (Prisma middleware) captures change
    ↓
6. Write to AuditLog table (async, non-blocking)
    ↓
7. Broadcast SSE event to all connected clients
    ↓
8. Clients receive event and update UI (< 1 second total)
```

**Deployment Workflow:**

```
Developer pushes to Git branch
    ↓
GitHub webhook triggers Vercel build
    ↓
Vercel builds Next.js app
    ↓
Environment variables injected from Vercel dashboard
    ↓
Database migrations run (Prisma)
    ↓
Preview deployment created (branch-specific URL)
    ↓
Merge to main → Production deployment
```

---

## Non-Functional Requirements

### Performance

**Targets:**
- Initial page load: < 2 seconds (Next.js optimized)
- Tab navigation: < 200ms (client-side routing)
- SSE connection establishment: < 500ms
- Database query response: < 100ms (indexed queries)
- API endpoint response: < 300ms (p95)

**Optimization Strategies:**
- Next.js automatic code splitting
- Vercel Edge Network CDN
- Prisma connection pooling
- Database indexes on frequently queried fields
- React Server Components for reduced client bundle

**Measurement:**
- Vercel Analytics for Web Vitals (LCP, FID, CLS)
- Console.time() for SSE connection timing
- Prisma query logs for slow queries (> 100ms)

### Security

**Authentication Preparation:**
- User table with `whitelisted` boolean (Epic 2 enforces)
- Role enum (OPERATOR, ADMINISTRATOR) for RBAC
- Session table for NextAuth.js JWT storage
- Email index for fast whitelist lookups

**Data Protection:**
- Environment variables for secrets (never committed to Git)
- `.env.local` in `.gitignore`
- HTTPS enforced by Vercel (automatic SSL)
- UUID primary keys (non-sequential, harder to enumerate)

**Audit Trail:**
- All mutations logged automatically via Prisma middleware
- Captures: user_id, timestamp, table, record_id, action_type, old/new values
- Append-only AuditLog table (no updates/deletes allowed)
- Indexed by timestamp DESC for fast queries

**GDPR Compliance:**
- Soft delete (`deletedAt`) for bonfire registrations
- Automatic cleanup after 90 days (Vercel Cron Job in Story 1.8)
- Audit log retention: 1 year (configurable)

### Reliability/Availability

**Target Uptime:** 99.5% (acceptable for 4-6 user internal tool)

**Vercel Platform Guarantees:**
- 99.99% uptime SLA on Pro plan (upgrade path available)
- Automatic failover and redundancy
- Zero-downtime deployments

**SSE Resilience:**
- Automatic reconnection on connection drop
- Exponential backoff (1s, 2s, 4s, 8s max)
- Fallback to polling (5-second interval) if SSE unavailable
- Client-side connection state management (React Context)

**Database Resilience:**
- Vercel Postgres automatic backups (daily)
- Connection pooling (max 10 connections)
- Prisma retry logic on transient failures

**Error Handling:**
- Toast notifications for user-facing errors (react-hot-toast)
- API error responses with structured format
- Unhandled errors logged to Vercel Logs
- No sensitive data in error messages

### Observability

**Logging:**
- Vercel Logs for all API routes (stdout/stderr)
- Console logging for client-side errors
- Audit log table for user actions
- SSE connection events logged

**Metrics (Future Enhancement):**
- Vercel Analytics: Web Vitals, pageviews, unique users
- Database query metrics via Prisma (logged to console)
- SSE connection count (logged every 30 seconds)

**Monitoring:**
- Vercel build status emails
- Manual health checks via `/api/health`
- No automated alerting in MVP (acceptable for small team)

**Debugging:**
- Source maps enabled in Vercel production builds
- React DevTools enabled in development
- Prisma Studio for database inspection

---

## Dependencies and Integrations

**Core Dependencies (package.json):**

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^6.0.0",
    "next-auth": "^5.0.0-beta",
    "@auth/prisma-adapter": "^2.0.0",
    "zustand": "^4.5.0",
    "tailwindcss": "^3.4.0",
    "shadcn-ui": "latest",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^3.0.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0"
  }
}
```

**External Service Integrations:**

| Service | Purpose | Epic | Configuration |
|---------|---------|------|---------------|
| Vercel Postgres | Database hosting | 1.2 | `DATABASE_URL` env var |
| Vercel Platform | Deployment, hosting | 1.6 | Git repo connection |
| Google OAuth | Authentication (prep only) | Epic 2 | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Google Maps API | Bonfire map display | Epic 5 | `GOOGLE_MAPS_API_KEY` |
| Azure OpenAI | Bonfire email parsing | Epic 5 | `AZURE_OPENAI_*` env vars |
| Power Automate | Email monitoring | Epic 5 | Webhook URL (configured externally) |

**Version Constraints:**
- Node.js: >=22.0.0 (LTS)
- Next.js: ^14.0.0 (App Router required)
- Prisma: ^6.0.0 (latest features)
- TypeScript: ^5.0.0 (modern syntax)
- React: ^19.0.0 (concurrent features)

---

## Acceptance Criteria (Authoritative)

**Epic-Level Acceptance Criteria:**

1. **AC-1.1:** Next.js 14 project runs successfully on `localhost:3000` with TypeScript, Tailwind CSS, and ESLint configured
2. **AC-1.2:** Complete database schema with 8 tables (User, Event, FlashMessage, VehicleStatus, DutyRoster, BonfireRegistration, AuditLog, Session) deployed to Vercel Postgres
3. **AC-1.3:** Prisma Client generates types for all models, migrations are version-controlled
4. **AC-1.4:** shadcn/ui components (Button, Input, Card, Dialog, Tabs) installed and themed for emergency services aesthetic
5. **AC-1.5:** Four-tab navigation (Hva Skjer, Flash, Bålmelding, Innstillinger) functional with < 200ms tab switching
6. **AC-1.6:** "Hva Skjer" folder displays three-section layout (events left, bilstatus top-right, vaktplan bottom-right)
7. **AC-1.7:** Application deployed to Vercel with continuous deployment on Git push
8. **AC-1.8:** SSE endpoint `/api/sse` broadcasts events to all connected clients in < 1 second
9. **AC-1.9:** Prisma middleware logs all CREATE/UPDATE/DELETE operations to AuditLog table automatically
10. **AC-1.10:** Environment variables configured in Vercel for DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
11. **AC-1.11:** Git repository has proper `.gitignore` (node_modules, .env*, .next, etc.) and README.md
12. **AC-1.12:** Application runs without errors in browser console (no TypeScript errors, no React warnings)

---

## Traceability Mapping

| AC | Spec Section | Component/API | Test Idea |
|----|--------------|---------------|-----------|
| AC-1.1 | Project Structure | Next.js app, package.json | Run `npm run dev`, verify localhost:3000 accessible |
| AC-1.2 | Data Models | Prisma schema, PostgreSQL | Run `npx prisma studio`, verify 8 tables exist |
| AC-1.3 | Data Models | Prisma Client, migrations | Run `npx prisma generate`, verify types in node_modules |
| AC-1.4 | UI Layer | shadcn/ui components | Render Button/Dialog/Tabs, verify emergency theme colors |
| AC-1.5 | Tab Navigation | `/hva-skjer`, `/flash`, `/balmelding`, `/innstillinger` routes | Click tabs, measure time with Performance API |
| AC-1.6 | Layout System | CSS Grid layout in `hva-skjer/page.tsx` | Visual inspection: 3 sections visible |
| AC-1.7 | Deployment | Vercel project, GitHub integration | Push commit, verify preview deployment URL |
| AC-1.8 | SSE Manager | `/api/sse` route | Send event, measure time to client receipt (< 1s) |
| AC-1.9 | Audit Logger | Prisma middleware, AuditLog table | Create/update/delete record, verify AuditLog entry |
| AC-1.10 | Deployment | Vercel dashboard env vars | Check Vercel settings, verify DATABASE_URL set |
| AC-1.11 | Project Structure | `.gitignore`, `README.md` | Verify .env not in Git, README exists |
| AC-1.12 | All | Next.js app, TypeScript config | Open browser console, verify no errors |

---

## Risks, Assumptions, Open Questions

### Risks

**Risk-1: SSE Connection Limits on Vercel**
- **Description:** Vercel serverless functions have 10-second timeout, may not support long-lived SSE connections
- **Mitigation:** Use Edge Functions (unlimited duration) or implement polling fallback (5-second interval)
- **Owner:** Story 1.7

**Risk-2: Database Connection Pooling**
- **Description:** Vercel serverless functions create new database connections per request, may exhaust Postgres pool
- **Mitigation:** Use Prisma connection pooling, limit to 10 concurrent connections
- **Owner:** Story 1.2

**Risk-3: First-Time Vercel Deployment**
- **Description:** Team unfamiliar with Vercel, may encounter unexpected configuration issues
- **Mitigation:** Follow official Vercel Next.js deployment guide step-by-step, allocate extra time
- **Owner:** Story 1.6

**Risk-4: Real-Time Performance Under Load**
- **Description:** SSE may not meet < 1 second target with 6 concurrent dispatchers
- **Mitigation:** Test with multiple browser tabs, measure latency, upgrade to Edge Functions if needed
- **Owner:** Story 1.7

### Assumptions

**Assumption-1:** Vercel free tier sufficient for MVP (4-6 users, low traffic)
**Assumption-2:** Team has access to Google Cloud Console for OAuth setup (Epic 2)
**Assumption-3:** PostgreSQL database size < 1GB (Vercel Postgres free tier limit)
**Assumption-4:** No need for custom domain in MVP (vercel.app subdomain acceptable)
**Assumption-5:** Team has basic Git/GitHub experience for CI/CD workflow

### Open Questions

**Question-1:** Should we use Vercel Edge Functions or standard serverless functions for SSE?
- **Answer Needed By:** Story 1.7
- **Blocker:** Yes (affects architecture decision)

**Question-2:** What is the Vercel Postgres database URL? Need to configure before Story 1.2.
- **Answer Needed By:** Story 1.2
- **Blocker:** Yes (cannot run migrations without database)

**Question-3:** Should we implement automatic database backups beyond Vercel's daily backups?
- **Answer Needed By:** Story 1.2
- **Blocker:** No (can add later)

---

## Test Strategy Summary

### Test Levels

**Unit Tests (Vitest):**
- Prisma middleware (audit logging logic)
- Utility functions (date calculations, validation helpers)
- Component logic (tab state management)
- API route handlers (input validation, error handling)

**Integration Tests (Vitest + @testing-library/react):**
- Tab navigation flow (click tab → URL changes → correct page renders)
- SSE connection management (connect → receive event → update state)
- Audit log creation (database mutation → AuditLog entry exists)

**End-to-End Tests (Playwright):**
- Complete user journey: Open app → see 4 tabs → click each tab → verify content
- Real-time sync: Open 2 browser windows → trigger SSE event → verify both update
- Deployment smoke test: Visit production URL → verify app loads without errors

### Test Coverage Goals

**Critical Paths (Must Test):**
- Project initialization (Story 1.1): Manual verification
- Database migrations (Story 1.2): Prisma test database
- Tab navigation (Story 1.4): Playwright E2E test
- SSE real-time (Story 1.7): Integration test with multiple clients
- Audit logging (Story 1.8): Unit test + integration test

**Acceptable Coverage:**
- Unit tests: 70%+ for utility functions
- Integration tests: All critical API routes
- E2E tests: Happy path for each story

### Test Frameworks

- **Vitest:** Fast unit/integration tests (compatible with Vite)
- **@testing-library/react:** Component testing (user-centric assertions)
- **Playwright:** Cross-browser E2E tests (Chromium only in MVP)
- **Prisma Test Database:** Separate test schema for migrations

### Edge Cases to Test

- SSE connection drop and reconnection
- Database connection pool exhaustion
- Invalid environment variables (app should fail gracefully)
- Multiple rapid tab switches (navigation race conditions)
- Audit log creation failure (should not block main operation)

---

**Ready for Implementation:** This tech spec is complete and ready for story creation. Use the `create-story` workflow to generate individual story implementation plans for Stories 1.1 through 1.8.
