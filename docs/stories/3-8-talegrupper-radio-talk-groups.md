# Story 3.8: Talegrupper (Radio Talk Groups)

Status: done

## Story

As an **administrator**,
I want to **manage assigned radio talk groups for the current situation**,
so that **dispatchers know which radio channels are active**.

## Acceptance Criteria

1. **[AC3.8.1]** Talegrupper section displayed below Vaktplan
2. **[AC3.8.2]** Each talegruppe shows name and details
3. **[AC3.8.3]** Admin can add new talegrupper
4. **[AC3.8.4]** Admin can edit existing talegrupper
5. **[AC3.8.5]** Admin can delete talegrupper
6. **[AC3.8.6]** Operators see read-only view
7. **[AC3.8.7]** Changes sync via SSE in real-time
8. **[AC3.8.8]** All CRUD actions audit-logged

## Tasks / Subtasks

- [ ] **Task 1: Create Talegrupper API** (AC: 3, 4, 5, 6, 8)
  - [ ] Create GET /api/talegrupper endpoint
  - [ ] Create POST /api/talegrupper endpoint (admin only)
  - [ ] Create PATCH /api/talegrupper/[id] endpoint (admin only)
  - [ ] Create DELETE /api/talegrupper/[id] endpoint (admin only)
  - [ ] Add Zod validation schemas
  - [ ] Wrap operations in audit context
  - [ ] Add talegruppe SSE event types to lib/sse.ts

- [ ] **Task 2: Create TalegrupperSection component** (AC: 1, 2, 3, 4, 5, 6, 7)
  - [ ] Display list of talegrupper (name + details)
  - [ ] Add button for administrators
  - [ ] Edit/delete buttons for each entry (admin only)
  - [ ] Add/Edit dialog with name and details fields
  - [ ] Delete confirmation dialog
  - [ ] SSE subscription for real-time updates
  - [ ] Role-based visibility of action buttons

- [ ] **Task 3: Integrate into layout** (AC: 1)
  - [ ] Add TalegrupperSection below VaktplanSection in hva-skjer-layout
  - [ ] Ensure proper spacing and styling

- [ ] **Task 4: Test and verify** (AC: 1-8)
  - [ ] Build passes with no lint errors
  - [ ] Admin can add/edit/delete talegrupper
  - [ ] Operator sees read-only view
  - [ ] Changes appear in other browser tabs via SSE
  - [ ] AuditLog contains talegruppe modification entries

## Dev Notes

### Prisma Model

```prisma
model Talegruppe {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(50)   // e.g., "Skogbrann-01"
  details   String   @db.VarChar(200)  // e.g., "06-Brann-19"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt])
}
```

### API Contracts

**GET /api/talegrupper**
```typescript
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
{
  success: true,
  data: { deleted: true }
}
```

### SSE Events

```typescript
// Add to lib/sse.ts SSEEventType
type SSEEventType =
  | ... existing types ...
  | "talegruppe_created"
  | "talegruppe_updated"
  | "talegruppe_deleted"
```

### UI Design Notes

- Similar visual design to Priority (Pri 1) entries in Viktige meldinger
- Card-style display for each talegruppe
- Name prominently displayed, details as secondary text
- Red badge or highlight for visual consistency with operational importance
- Located in right column below Vaktplan

### References

- [Source: docs/tech-spec-epic-3.md#Story 3.8]
- [Source: docs/PRD.md#FR4.3 - Talegrupper]
- [Source: docs/epics.md#Story 3.8]
- [Source: components/hva-skjer/viktige-meldinger.tsx] (UI pattern reference)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- Story created as part of correct-course workflow (2025-11-27)
- New feature added to Epic 3

### File List

| File | Action |
|------|--------|
| app/api/talegrupper/route.ts | CREATE |
| app/api/talegrupper/[id]/route.ts | CREATE |
| components/hva-skjer/talegrupper-section.tsx | CREATE |
| components/hva-skjer/hva-skjer-layout.tsx | MODIFY |
| lib/sse.ts | MODIFY |

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-27 | Story created for correct-course | Claude Opus 4.5 |
