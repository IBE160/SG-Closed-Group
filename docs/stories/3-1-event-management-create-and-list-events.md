# Story 3.1: Event Management - Create and List Events

Status: review

## Story

As a **dispatcher**,
I want to **create operational events and see them in a list**,
so that **all dispatchers are aware of important information in real-time**.

## Acceptance Criteria

1. **[AC3.1.1]** Event created with title, description, priority appears in "Viktige meldinger" list immediately
2. **[AC3.1.2]** All connected dispatchers see new event via SSE broadcast in < 2 seconds
3. **[AC3.1.3]** Events are sorted with Pri 1 (CRITICAL) at top, then by createdAt timestamp DESC
4. **[AC3.1.4]** Event creation is logged in AuditLog with creator's user_id and timestamp
5. **[AC3.1.5]** Empty state message displays "Ingen hendelser" when no events exist

## Tasks / Subtasks

- [x] **Task 1: Create Event API endpoint** (AC: 1, 2, 4) ✅
  - [x] Create `/api/events/route.ts` with GET and POST handlers
  - [x] Implement Zod validation schema for event creation (title: 1-50 chars, description: 0-200 chars, priority: CRITICAL|NORMAL)
  - [x] Add authentication check using `auth()` from NextAuth
  - [x] Implement Prisma create with audit logging via `runWithAuditContext`
  - [x] Return standardized API response format `{ success: true, data: Event }`

- [x] **Task 2: Implement SSE broadcast for new events** (AC: 2) ✅
  - [x] Reused existing SSE broadcast utility from `@/lib/sse`
  - [x] Broadcast `{ type: "event_created", data: event }` on POST success
  - [x] SSE delivers to all connected clients via existing infrastructure

- [x] **Task 3: Create EventList component** (AC: 1, 3, 5) ✅
  - [x] Create `components/events/EventList.tsx`
  - [x] Fetch events from `/api/events` on mount
  - [x] Sort events: CRITICAL priority first, then by createdAt DESC
  - [x] Display empty state "Ingen hendelser" when no events
  - [x] Subscribe to SSE for real-time updates (event_created, event_updated, event_deleted)

- [x] **Task 4: Create EventCard component** (AC: 1, 3) ✅
  - [x] Create `components/events/EventCard.tsx`
  - [x] Display title, description, priority, timestamp
  - [x] Apply red styling (border, background, badge) for CRITICAL priority events
  - [x] Standard styling for NORMAL priority

- [x] **Task 5: Create EventForm component** (AC: 1) ✅
  - [x] Create `components/events/EventForm.tsx`
  - [x] Use shadcn/ui Dialog for modal form
  - [x] Implement react-hook-form with Zod resolver
  - [x] Add "Ny hendelse" button to trigger dialog
  - [x] Submit to POST `/api/events`

- [x] **Task 6: Integrate into Hva Skjer page** (AC: 1, 3, 5) ✅
  - [x] Add EventList to ViktigeMeldinger component in "Hva Skjer" layout
  - [x] Add "Ny hendelse" button in CardHeader
  - [x] SSE connection established via existing SSEProvider

- [ ] **Task 7: Test and verify** (AC: 1-5)
  - [ ] Manual test: Create event, verify appears in list
  - [ ] Manual test: Open two browser tabs, create event, verify sync
  - [ ] Verify AuditLog entry created after event creation
  - [ ] Verify empty state displays correctly

## Dev Notes

### Architecture Patterns

- **API Response Format**: All endpoints use `{ success: true, data: ... }` or `{ success: false, error: { message, code } }`
- **SSE Event Format**: `{ type: string, data: any, timestamp: ISO8601 }`
- **Audit Logging**: Use Prisma middleware or manual logging to AuditLog table
- **Authentication**: Use `auth()` from `@/lib/auth` for session validation

### Components to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/events/route.ts` | CREATE | Event API (GET list, POST create) |
| `src/components/events/EventList.tsx` | CREATE | Event list display |
| `src/components/events/EventCard.tsx` | CREATE | Individual event card |
| `src/components/events/EventForm.tsx` | CREATE | Create event dialog |
| `src/lib/validators.ts` | MODIFY | Add eventSchema |
| `src/app/(dashboard)/hva-skjer/page.tsx` | MODIFY | Integrate EventList |

### Existing Infrastructure to Reuse

- **SSE Provider**: Check `src/components/layout/SSEProvider.tsx` or `src/lib/sse.ts` from Epic 1.7
- **Auth utilities**: `auth()` from `@/lib/auth` (Epic 2)
- **UI Components**: shadcn/ui Dialog, Button, Input, Card (Epic 1.3)
- **Prisma Client**: `prisma` from `@/lib/prisma` (Epic 1.2)

### Database Schema (from schema.prisma)

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

### Testing Standards

- Manual verification for MVP
- Verify SSE broadcast with multi-tab testing
- Check AuditLog table after operations

### Project Structure Notes

- Events components go in `src/components/events/`
- API routes follow App Router convention: `src/app/api/events/route.ts`
- Validators centralized in `src/lib/validators.ts`

### References

- [Source: docs/tech-spec-epic-3.md#Story-3.1]
- [Source: docs/epics.md#Story-3.1]
- [Source: docs/architecture.md#API-Response-Format]
- [Source: docs/architecture.md#SSE-Event-Format]
- [Source: prisma/schema.prisma#Event]

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/3-1-event-management-create-and-list-events.context.xml](../sprint-artifacts/3-1-event-management-create-and-list-events.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build passed successfully
- Lint passed with no errors

### Completion Notes List

- Used `runWithAuditContext` for audit logging (not `setAuditUser`)
- Components placed in `components/events/` (not `src/components/events/`)
- Integrated into existing `ViktigeMeldinger` component rather than modifying page directly

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-26 | Story drafted | BIP (AI) |
| 2025-11-27 | Tasks 1-6 implemented | Claude Opus 4.5 |

### File List

| File | Action | Description |
|------|--------|-------------|
| `app/api/events/route.ts` | CREATED | Event API with GET/POST handlers |
| `components/events/EventCard.tsx` | CREATED | Event card with priority styling |
| `components/events/EventList.tsx` | CREATED | Event list with SSE subscription |
| `components/events/EventForm.tsx` | CREATED | Dialog form for creating events |
| `components/hva-skjer/viktige-meldinger.tsx` | MODIFIED | Integrated EventList and EventForm |
