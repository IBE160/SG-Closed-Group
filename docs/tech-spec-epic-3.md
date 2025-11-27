# Technical Specification - Epic 3: Event Control Dashboard

**Project:** ibe160 - Hva Skjer
**Epic:** 3 - Event Control Dashboard
**Author:** BIP (AI-generated)
**Date:** 2025-11-26
**Version:** 1.0

---

## Executive Summary

Epic 3 delivers the core operational awareness features for emergency dispatchers: event management (Viktige meldinger), vehicle rotation tracking (Bilstatus), and duty roster display (Vaktplan). All features synchronize in real-time across 4-6 concurrent dispatchers using the SSE infrastructure from Epic 1.

**Key Deliverables:**
- Event CRUD with two-priority system (Pri 1/Normal)
- Bilstatus vehicle rotation (S111/S112) with mutual exclusivity
- Vaktplan duty roster display and admin editing
- Real-time synchronization (< 2 seconds)
- Full audit logging for compliance

---

## Overview

Epic 3 builds on the foundation from Epic 1 (infrastructure) and Epic 2 (authentication) to deliver the primary operational dashboard features. The "Hva Skjer" tab serves as the central operational hub where dispatchers monitor events, vehicle status, and duty assignments.

### Business Context

Emergency dispatchers need instant visibility into:
1. **Viktige meldinger** - Critical operational events that all dispatchers must be aware of
2. **Bilstatus** - Which fire truck (S111 or S112) is ready for the next call
3. **Vaktplan** - Who is on duty for key positions this week

All information must sync across all dispatcher workstations in real-time to prevent miscommunication during emergencies.

---

## Objectives and Scope

### In Scope

- **Event Management:**
  - Create, read, update, delete events
  - Two-priority system: CRITICAL (Pri 1, red) and NORMAL
  - Real-time synchronization via SSE
  - Soft delete with audit logging

- **Bilstatus (Vehicle Rotation):**
  - Display S111/S112 status boxes (Green/Red/Grey)
  - One-click toggle between trucks
  - Grey status with required reason note
  - Mutual exclusivity enforcement
  - Real-time sync (< 1 second)

- **Vaktplan (Duty Roster):**
  - Read-only display for operators
  - Administrator editing capability
  - Week-based navigation
  - Position-to-person assignments

### Out of Scope

- Event categories/tags (future enhancement)
- Historical event analytics
- Multi-week duty roster bulk editing
- Vehicle location tracking

---

## System Architecture Alignment

### Component Mapping

| Component | Location | Purpose |
|-----------|----------|---------|
| EventList | `src/components/events/EventList.tsx` | Display events in Viktige meldinger |
| EventForm | `src/components/events/EventForm.tsx` | Create/edit event dialog |
| EventCard | `src/components/events/EventCard.tsx` | Individual event display |
| VehicleStatusBox | `src/components/bilstatus/VehicleStatusBox.tsx` | S111/S112 status display |
| DutyRoster | `src/components/vaktplan/DutyRoster.tsx` | Weekly roster display |

### Data Flow

```
User Action → API Route → Prisma Database → SSE Broadcast → All Dispatchers
```

### Real-Time Pattern

Epic 3 uses the SSE infrastructure from Story 1.7:

```typescript
// Event types for Epic 3
type SSEEventType =
  | "event_created"
  | "event_updated"
  | "event_deleted"
  | "bilstatus_update"
  | "vaktplan_update"
```

---

## Detailed Design

### Services and Modules

| Module | Responsibility | API Endpoints |
|--------|---------------|---------------|
| Events | Event CRUD, filtering, sorting | `/api/events`, `/api/events/[id]` |
| Bilstatus | Vehicle status management | `/api/bilstatus` |
| Vaktplan | Duty roster management | `/api/vaktplan` |

### Data Models and Contracts

#### Event Model (Prisma)

```prisma
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
```

#### VehicleStatus Model (Prisma)

```prisma
model VehicleStatus {
  id        String            @id @default(uuid())
  vehicleId String            @unique // "S111" or "S112"
  status    VehicleStatusType @default(OUT)
  note      String?           @db.VarChar(50) // Grey status reason
  updatedBy String
  updatedAt DateTime          @updatedAt

  @@index([vehicleId])
}

enum VehicleStatusType {
  READY           // Green - available
  OUT             // Red - just responded
  OUT_OF_SERVICE  // Grey - maintenance/training
}
```

#### DutyRoster Model (Prisma)

```prisma
// Fixed structure: Vakt09 + Lederstøtte (no generic positions)
model DutyRoster {
  id               String   @id @default(uuid())
  weekNumber       Int      // ISO week number (1-53)
  year             Int
  vakt09Name       String?  @db.VarChar(100)  // Vakt09 assigned person
  lederstotteName  String?  @db.VarChar(100)  // Lederstøtte assigned person
  lederstottePhone String?  @db.VarChar(20)   // Lederstøtte phone number
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([weekNumber, year])  // One entry per week
  @@index([weekNumber, year])
}
```

#### Talegruppe Model (Prisma)

```prisma
// Radio talk group assignments (not week-based)
model Talegruppe {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(50)   // e.g., "Skogbrann-01"
  details   String   @db.VarChar(200)  // e.g., "06-Brann-19"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt])
}
```

### APIs and Interfaces

#### Events API

**GET /api/events**
```typescript
// Response
{
  success: true,
  data: Event[]
}

// Query params (optional)
?status=ACTIVE
?priority=CRITICAL
```

**POST /api/events**
```typescript
// Request
{
  title: string,       // 1-50 chars
  description: string, // 0-200 chars
  priority: "CRITICAL" | "NORMAL"
}

// Response
{
  success: true,
  data: Event
}
```

**PATCH /api/events/[id]**
```typescript
// Request
{
  title?: string,
  description?: string,
  priority?: "CRITICAL" | "NORMAL",
  status?: "ACTIVE" | "RESOLVED" | "ARCHIVED"
}

// Response
{
  success: true,
  data: Event
}
```

**DELETE /api/events/[id]**
```typescript
// Soft delete - sets deletedAt and deletedBy

// Response
{
  success: true
}
```

#### Bilstatus API

**GET /api/bilstatus**
```typescript
// Response
{
  success: true,
  data: {
    S111: { status: "READY" | "OUT" | "OUT_OF_SERVICE", note: string | null },
    S112: { status: "READY" | "OUT" | "OUT_OF_SERVICE", note: string | null }
  }
}
```

**PATCH /api/bilstatus**
```typescript
// Request - Toggle action
{
  vehicle: "S111" | "S112",
  action: "toggle"
}

// Request - Set grey (out of service)
{
  vehicle: "S111" | "S112",
  action: "set_grey",
  note: string  // Required
}

// Request - Clear grey
{
  vehicle: "S111" | "S112",
  action: "clear_grey"
}

// Response
{
  success: true,
  data: { S111: {...}, S112: {...} }
}
```

#### Vaktplan API

**GET /api/vaktplan**
```typescript
// Query params
?week=48&year=2025

// Response
{
  success: true,
  data: {
    id: string,
    week: 48,
    year: 2025,
    vakt09Name: "Ola Nordmann" | null,
    lederstotteName: "Kari Hansen" | null,
    lederstottePhone: "+47 123 45 678" | null
  }
}
```

**POST /api/vaktplan** (Admin only - upsert)
```typescript
// Request (creates or updates roster for the week)
{
  week: number,
  year: number,
  vakt09Name?: string,
  lederstotteName?: string,
  lederstottePhone?: string
}

// Response
{
  success: true,
  data: DutyRoster
}
```

#### Talegrupper API

**GET /api/talegrupper**
```typescript
// Response
{
  success: true,
  data: Talegruppe[]  // Ordered by createdAt DESC
}
```

**POST /api/talegrupper** (Admin only)
```typescript
// Request
{
  name: string,    // 1-50 chars
  details: string  // 1-200 chars
}

// Response
{
  success: true,
  data: Talegruppe
}
```

**PATCH /api/talegrupper/[id]** (Admin only)
```typescript
// Request
{
  name?: string,
  details?: string
}

// Response
{
  success: true,
  data: Talegruppe
}
```

**DELETE /api/talegrupper/[id]** (Admin only)
```typescript
// Response
{
  success: true,
  data: { deleted: true }
}
```

### Workflows and Sequencing

#### Event Creation Flow

```
1. Dispatcher clicks "Ny hendelse" button
2. EventForm dialog opens
3. Fill in title, description, priority
4. Submit → POST /api/events
5. Server creates event in database
6. Server broadcasts SSE: { type: "event_created", data: event }
7. All connected dispatchers receive event
8. Event appears in EventList sorted by priority, then timestamp
```

#### Bilstatus Toggle Flow

```
1. Dispatcher clicks S111 box (currently RED)
2. PATCH /api/bilstatus { vehicle: "S111", action: "toggle" }
3. Server validates:
   - Neither truck is GREY
   - Request is from authenticated user
4. Server updates database:
   - S111: RED → GREEN
   - S112: GREEN → RED (automatic)
5. Server broadcasts SSE: { type: "bilstatus_update", data: {...} }
6. All dispatchers see updated status < 1 second
```

#### Bilstatus Grey Status Flow

```
1. Dispatcher right-clicks S111 box
2. Context menu shows "Sett ute av drift"
3. Dialog opens for reason note (required)
4. PATCH /api/bilstatus { vehicle: "S111", action: "set_grey", note: "Vedlikehold" }
5. Server updates:
   - S111: → GREY with note
   - S112: → GREEN (forced, safety guarantee)
6. Server broadcasts SSE update
7. All dispatchers see grey box with note
```

---

## Non-Functional Requirements

### Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Event creation | < 500ms | API response time |
| SSE broadcast delivery | < 1 second | End-to-end |
| Bilstatus toggle | < 300ms | API response time |
| Event list render | < 100ms | With 50 events |
| Vaktplan load | < 500ms | Initial page load |

### Security

- All endpoints require authentication (NextAuth session)
- Role-based access:
  - Operators: Full event CRUD, bilstatus read/update, vaktplan read
  - Administrators: All operator permissions + vaktplan edit
- Input validation with Zod schemas
- XSS prevention via React escaping
- CSRF protection via NextAuth cookies

### Reliability/Availability

- SSE auto-reconnect on connection loss
- Polling fallback (5-second interval) if SSE fails
- Optimistic UI updates with rollback on error
- Database constraints prevent invalid states (e.g., both trucks GREEN)

### Observability

- Console logging with prefixes: `[EVENT]`, `[BILSTATUS]`, `[VAKTPLAN]`
- Audit log entries for all mutations
- SSE connection status indicator in UI
- Vercel logs for server-side errors

---

## Dependencies and Integrations

### From Epic 1

| Dependency | Story | Usage |
|------------|-------|-------|
| Prisma ORM | 1.2 | Database operations |
| shadcn/ui | 1.3 | UI components (Dialog, Button, Card) |
| Tab navigation | 1.4 | "Hva Skjer" tab |
| Layout structure | 1.5 | Left/right column layout |
| SSE infrastructure | 1.7 | Real-time updates |
| Audit logging | 1.8 | Action tracking |

### From Epic 2

| Dependency | Story | Usage |
|------------|-------|-------|
| Authentication | 2.1 | Session validation |
| Authorization | 2.3 | Role-based access |
| Protected routes | 2.4 | API endpoint protection |

### NPM Dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^6.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "date-fns": "^3.x",
    "lucide-react": "^0.x"
  }
}
```

---

## Acceptance Criteria (Authoritative)

### Story 3.1: Event Management - Create and List Events

1. [AC3.1.1] Event created with title, description, priority appears in list immediately
2. [AC3.1.2] All connected dispatchers see new event in < 2 seconds
3. [AC3.1.3] Events sorted: Pri 1 at top, then by timestamp DESC
4. [AC3.1.4] Event creation logged in AuditLog with creator's user_id
5. [AC3.1.5] Empty state message displays when no events exist

### Story 3.2: Event Management - Edit and Delete Events

1. [AC3.2.1] Edited event updates broadcast to all dispatchers in real-time
2. [AC3.2.2] Deleted event removed from view (soft delete with deletedAt)
3. [AC3.2.3] All operators can edit/delete any event
4. [AC3.2.4] Edit/delete actions logged in AuditLog
5. [AC3.2.5] Optimistic UI provides immediate feedback

### Story 3.3: Priority System and Filtering

1. [AC3.3.1] Pri 1 events highlighted in red at top of list
2. [AC3.3.2] Normal events displayed with standard styling below
3. [AC3.3.3] Filter toggle for "All Events" / "Pri 1 Only"
4. [AC3.3.4] Filter state persists per user session
5. [AC3.3.5] Color-coding meets WCAG contrast requirements

### Story 3.4: Bilstatus - Status Display and Toggle

1. [AC3.4.1] Two boxes displayed for S111 and S112
2. [AC3.4.2] Colors: Green (READY), Red (OUT), Grey (OUT_OF_SERVICE)
3. [AC3.4.3] Clicking green truck toggles: clicked→red, paired→green
4. [AC3.4.4] Status changes broadcast to all dispatchers < 1 second
5. [AC3.4.5] Only one truck can be green at a time (if neither grey)

### Story 3.5: Bilstatus - Grey Status with Notes

1. [AC3.5.1] Right-click shows context menu with "Sett ute av drift"
2. [AC3.5.2] Dialog requires reason note before setting grey
3. [AC3.5.3] Grey truck displays note text
4. [AC3.5.4] Paired truck automatically becomes green
5. [AC3.5.5] Can edit note or cancel grey status via context menu

### Story 3.6: Vaktplan - Duty Roster Display

1. [AC3.6.1] Vakt09 name displayed for current week
2. [AC3.6.2] Lederstøtte name AND phone displayed for current week
3. [AC3.6.3] Current week auto-detected from system date
4. [AC3.6.4] Week navigation (prev/next) available
5. [AC3.6.5] Display fits in allocated bottom-right layout space

### Story 3.7: Vaktplan - Administrator Editing

1. [AC3.7.1] Administrators can modify Vakt09 name
2. [AC3.7.2] Administrators can modify Lederstøtte name and phone
3. [AC3.7.3] Can navigate to future weeks to pre-assign duties
4. [AC3.7.4] Changes visible to all dispatchers immediately via SSE
5. [AC3.7.5] Only administrators can edit (operators see read-only)
6. [AC3.7.6] Edit actions logged in AuditLog

### Story 3.8: Talegrupper (Radio Talk Groups)

1. [AC3.8.1] Talegrupper section displayed below Vaktplan
2. [AC3.8.2] Each talegruppe shows name and details
3. [AC3.8.3] Admin can add new talegrupper
4. [AC3.8.4] Admin can edit existing talegrupper
5. [AC3.8.5] Admin can delete talegrupper
6. [AC3.8.6] Operators see read-only view
7. [AC3.8.7] Changes sync via SSE in real-time
8. [AC3.8.8] All CRUD actions audit-logged

---

## Traceability Mapping

| AC | Spec Section | Component/API | Test Idea |
|----|--------------|---------------|-----------|
| AC3.1.1 | Events API POST | EventForm, `/api/events` | Create event, verify in list |
| AC3.1.2 | SSE Broadcast | SSEProvider | Multi-tab test, measure latency |
| AC3.1.3 | Event Sorting | EventList | Create Pri 1 and Normal, check order |
| AC3.1.4 | Audit Logging | Prisma middleware | Check AuditLog after create |
| AC3.1.5 | Empty State | EventList | View with no events |
| AC3.2.1 | Events API PATCH | EventForm, `/api/events/[id]` | Edit event, verify in other tabs |
| AC3.2.2 | Soft Delete | `/api/events/[id]` DELETE | Delete, check deletedAt set |
| AC3.2.3 | Authorization | authorize.ts | Test with operator role |
| AC3.2.4 | Audit Logging | Prisma middleware | Check AuditLog after edit/delete |
| AC3.2.5 | Optimistic UI | EventCard | Edit, observe immediate update |
| AC3.3.1 | Priority Styling | EventCard | Create Pri 1, check red styling |
| AC3.3.2 | Priority Sorting | EventList | Mixed priorities, check order |
| AC3.3.3 | Filter Toggle | EventList | Toggle filter, verify list changes |
| AC3.3.4 | Filter Persistence | localStorage | Toggle filter, refresh page |
| AC3.3.5 | WCAG Compliance | EventCard | Contrast checker tool |
| AC3.4.1 | Bilstatus UI | VehicleStatusBox | Visual inspection |
| AC3.4.2 | Status Colors | VehicleStatusBox | Set each status, verify color |
| AC3.4.3 | Toggle Logic | `/api/bilstatus` PATCH | Click green, verify swap |
| AC3.4.4 | SSE Latency | SSEProvider | Measure broadcast time |
| AC3.4.5 | Mutual Exclusivity | `/api/bilstatus` | Try to set both green, expect error |
| AC3.5.1 | Context Menu | VehicleStatusBox | Right-click, verify menu |
| AC3.5.2 | Note Required | Grey Dialog | Submit empty, expect error |
| AC3.5.3 | Note Display | VehicleStatusBox | Set grey with note, verify display |
| AC3.5.4 | Auto Green | `/api/bilstatus` | Set grey, check paired is green |
| AC3.5.5 | Edit/Cancel Grey | Context Menu | Edit note, cancel grey |
| AC3.6.1 | Vaktplan Display | VaktplanSection | Visual: Vakt09 name shown |
| AC3.6.2 | Lederstøtte Fields | VaktplanSection | Visual: name AND phone shown |
| AC3.6.3 | Auto Week | `/api/vaktplan` | Verify correct week number |
| AC3.6.4 | Week Navigation | VaktplanSection | Click prev/next, verify data changes |
| AC3.6.5 | Layout Fit | VaktplanSection | Visual inspection on target viewport |
| AC3.7.1 | Vakt09 Edit | `/api/vaktplan` POST | Edit Vakt09, verify change |
| AC3.7.2 | Lederstøtte Edit | `/api/vaktplan` POST | Edit name+phone, verify |
| AC3.7.3 | Week Navigation | VaktplanSection | Navigate weeks, pre-assign |
| AC3.7.4 | SSE Update | SSEProvider | Edit, verify in other tabs |
| AC3.7.5 | Role Check | authorize.ts | Try edit as operator, expect 403 |
| AC3.7.6 | Audit Logging | Prisma middleware | Check AuditLog after edit |
| AC3.8.1 | Talegrupper Section | TalegrupperSection | Visual: section below Vaktplan |
| AC3.8.2 | Entry Display | TalegrupperSection | Each shows name + details |
| AC3.8.3 | Add Talegruppe | `/api/talegrupper` POST | Create new, verify in list |
| AC3.8.4 | Edit Talegruppe | `/api/talegrupper/[id]` PATCH | Edit, verify change |
| AC3.8.5 | Delete Talegruppe | `/api/talegrupper/[id]` DELETE | Delete, verify removed |
| AC3.8.6 | Role Check (Read) | TalegrupperSection | Operator sees no edit buttons |
| AC3.8.7 | SSE Sync | SSEProvider | CRUD, verify in other tabs |
| AC3.8.8 | Audit Logging | Prisma middleware | Check AuditLog after CRUD |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| SSE connection instability | Users miss real-time updates | Polling fallback, reconnect logic |
| Concurrent bilstatus updates | Race conditions, invalid state | Database transactions, optimistic locking |
| Large event list performance | Slow rendering | Pagination, virtualization |

### Assumptions

- All dispatchers have stable internet connections (internal network)
- Shift schedules are organized by ISO week numbers
- Position names are standardized (vakthavende brannsjef, etc.)
- S111 and S112 are the only tracked vehicles

### Open Questions

1. **Q:** Should resolved events be archived automatically after X days?
   **A:** Future enhancement - keep in scope as manual status change for now

2. **Q:** What happens if both trucks need to be out of service simultaneously?
   **A:** Business rule prevents this - at least one must be ready. Edge case: escalate to supervisor.

3. **Q:** Should vaktplan support multiple weeks view?
   **A:** Out of scope for MVP - current week + navigation is sufficient

---

## Test Strategy Summary

### Unit Tests (Vitest)

- Event validation schemas
- Authorization helper functions
- Date/week calculation utilities
- Bilstatus state machine logic

### Integration Tests

- Event CRUD API endpoints
- Bilstatus toggle flow
- Vaktplan read/write with role checks
- SSE broadcast delivery

### E2E Tests (Playwright)

- Create event, verify in second browser tab
- Toggle bilstatus, verify sync
- Admin edit vaktplan flow
- Filter toggle persistence

### Manual Testing Checklist

- [ ] Event creation with all priority types
- [ ] Event edit from multiple users
- [ ] Bilstatus toggle under load
- [ ] Grey status with long note text
- [ ] Vaktplan week navigation
- [ ] Session expiration handling
- [ ] Network disconnection recovery

---

## Implementation Order

Recommended story implementation sequence:

1. **Story 3.1** - Event Create/List (establishes patterns)
2. **Story 3.2** - Event Edit/Delete (builds on 3.1)
3. **Story 3.3** - Priority System (enhances events)
4. **Story 3.4** - Bilstatus Display/Toggle (independent feature)
5. **Story 3.5** - Bilstatus Grey Status (builds on 3.4)
6. **Story 3.6** - Vaktplan Display (fixed fields: Vakt09 + Lederstøtte)
7. **Story 3.7** - Vaktplan Admin Edit (builds on 3.6)
8. **Story 3.8** - Talegrupper (builds on 3.7, similar UI patterns)

---

## References

- [PRD FR2: Event Management](./prd.md#fr2-event-management)
- [PRD FR3: Bilstatus](./prd.md#fr3-bilstatus)
- [PRD FR4: Vaktplan](./prd.md#fr4-vaktplan)
- [Architecture: Novel Patterns - Vehicle Rotation](./architecture.md#pattern-2-automatic-vehicle-rotation-with-mutual-exclusivity)
- [Epic 3 Stories](./epics.md#epic-3-event-control-dashboard)
- [Tech Spec Epic 2](./tech-spec-epic-2.md) (authentication patterns)

---

_Generated by epic-tech-context workflow v1.0_
_Date: 2025-11-26_
_For: BIP_
