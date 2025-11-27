# Story 3.2: Event Management - Edit and Delete Events

Status: done

## Story

As a **dispatcher**,
I want to **edit and delete operational events**,
so that **I can correct mistakes and remove outdated information in real-time**.

## Acceptance Criteria

1. **[AC3.2.1]** Edited event updates broadcast to all dispatchers in real-time via SSE
2. **[AC3.2.2]** Deleted event removed from view (soft delete with deletedAt timestamp)
3. **[AC3.2.3]** All operators can edit/delete any event (not restricted to creator)
4. **[AC3.2.4]** Edit/delete actions logged in AuditLog with user_id
5. **[AC3.2.5]** Optimistic UI provides immediate feedback before server confirms

## Tasks / Subtasks

- [x] **Task 1: Create Event API endpoints for PATCH and DELETE** (AC: 1, 2, 4)
  - [x] Create `/api/events/[id]/route.ts` with PATCH and DELETE handlers
  - [x] PATCH: Update title, description, priority, status
  - [x] DELETE: Soft delete by setting deletedAt and deletedBy
  - [x] Add authentication check using `auth()` from NextAuth
  - [x] Implement audit logging via `runWithAuditContext`
  - [x] Broadcast SSE event_updated / event_deleted on success

- [x] **Task 2: Add edit/delete actions to EventCard** (AC: 3, 5)
  - [x] Add dropdown menu with Edit and Delete options
  - [x] Use shadcn/ui DropdownMenu component
  - [x] Add confirmation dialog for delete action
  - [x] Implement optimistic UI update (immediate visual feedback)

- [x] **Task 3: Create EventEditDialog component** (AC: 1, 5)
  - [x] Create edit dialog that pre-fills existing event data
  - [x] Similar to EventForm but for editing
  - [x] Submit PATCH to `/api/events/[id]`
  - [x] Close dialog and show success on completion

- [x] **Task 4: Handle SSE events for updates and deletes** (AC: 1, 2)
  - [x] EventList already handles event_updated and event_deleted
  - [x] Added onUpdate callback to EventCard for immediate refetch
  - [x] Polling fallback (30s) for cross-tab sync in dev mode

- [x] **Task 5: Test and verify** (AC: 1-5)
  - [x] Manual test: Edit event, verify update in list
  - [x] Manual test: Delete event, verify removed from list
  - [x] AuditLog entries created for edit and delete
  - [x] Fixed form reset issue during polling

## Dev Notes

### Architecture Patterns

- **Soft Delete**: Set `deletedAt` timestamp instead of removing from database
- **API Response Format**: `{ success: true, data: ... }` or `{ success: false, error: { message, code } }`
- **SSE Event Types**: `event_updated`, `event_deleted`
- **Audit Logging**: Use `runWithAuditContext` from `@/lib/audit-context`

### API Specifications

**PATCH /api/events/[id]**
```typescript
// Request body
{
  title?: string,       // 1-50 chars
  description?: string, // 0-200 chars
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
// No request body - soft delete

// Response
{
  success: true,
  data: { id: string }
}
```

### Components to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `app/api/events/[id]/route.ts` | CREATE | Event PATCH/DELETE API |
| `components/events/EventCard.tsx` | MODIFY | Add edit/delete dropdown |
| `components/events/EventEditDialog.tsx` | CREATE | Edit event dialog |

### Existing Infrastructure to Reuse

- **SSE broadcast**: `broadcastSSE()` from `@/lib/sse`
- **Auth utilities**: `auth()` from `@/lib/auth`
- **Audit context**: `runWithAuditContext()` from `@/lib/audit-context`
- **UI Components**: shadcn/ui DropdownMenu, Dialog, AlertDialog
- **Event types in EventList**: Already handles event_updated and event_deleted

### Database Schema

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
  deletedAt   DateTime?   // Soft delete timestamp
  deletedBy   String?     // Who deleted it
}
```

### References

- [Source: docs/tech-spec-epic-3.md#Story-3.2]
- [Source: docs/architecture.md#API-Response-Format]
- [Source: docs/architecture.md#SSE-Event-Format]

## Dev Agent Record

### Context Reference

- Will be generated when story is marked ready

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build passed successfully
- Lint passed with no errors

### Completion Notes List

- Used `runWithAuditContext` for audit logging
- Created EventEditDialog as separate component
- Added AlertDialog for delete confirmation
- Used DropdownMenu for action menu on EventCard
- onUpdate callback triggers refetch for immediate UI update

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-27 | Story drafted | Claude Opus 4.5 |
| 2025-11-27 | Tasks 1-4 implemented | Claude Opus 4.5 |

### File List

| File | Action | Description |
|------|--------|-------------|
| `app/api/events/[id]/route.ts` | CREATED | Event PATCH/DELETE API with soft delete |
| `components/events/EventCard.tsx` | MODIFIED | Added dropdown menu with edit/delete |
| `components/events/EventEditDialog.tsx` | CREATED | Dialog for editing events |
| `components/events/EventList.tsx` | MODIFIED | Added onUpdate callback to EventCard |
| `components/ui/alert-dialog.tsx` | CREATED | shadcn/ui AlertDialog component |
