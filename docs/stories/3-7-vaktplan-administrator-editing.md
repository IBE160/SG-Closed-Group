# Story 3.7: Vaktplan - Administrator Editing

Status: done

## Story

As an **administrator**,
I want to **modify Vakt09 and Lederstøtte assignments for current and future weeks**,
so that **the roster stays current and all dispatchers see assignments in real-time**.

## Acceptance Criteria

1. **[AC3.7.1]** Administrators can modify Vakt09 name
2. **[AC3.7.2]** Administrators can modify Lederstøtte name and phone
3. **[AC3.7.3]** Can navigate to future weeks to pre-assign duties
4. **[AC3.7.4]** Changes visible to all dispatchers immediately via SSE
5. **[AC3.7.5]** Only administrators can edit (operators see read-only)
6. **[AC3.7.6]** Edit actions logged in AuditLog

## Tasks / Subtasks

- [ ] **Task 1: Rewrite Vaktplan API for fixed fields** (AC: 1, 2, 5, 6)
  - [ ] Rewrite GET /api/vaktplan for new schema (vakt09Name, lederstotteName, lederstottePhone)
  - [ ] Create POST /api/vaktplan for upsert (create or update week entry)
  - [ ] Remove old [id] route (not needed with single-entry-per-week)
  - [ ] Check administrator role before allowing modifications
  - [ ] Wrap operations in audit context for AuditLog
  - [ ] Broadcast SSE vaktplan_update on changes

- [ ] **Task 2: Rewrite VaktplanSection component** (AC: 1, 2, 3, 4, 5)
  - [ ] Display Vakt09 name field
  - [ ] Display Lederstøtte name AND phone fields
  - [ ] Week navigation (previous/next buttons)
  - [ ] Edit dialog with three fields (admin only)
  - [ ] Role-based visibility of edit button
  - [ ] SSE subscription for real-time updates

- [ ] **Task 3: Test and verify** (AC: 1-6)
  - [ ] Build passes with no lint errors
  - [ ] Admin can edit all three fields
  - [ ] Operator sees read-only view
  - [ ] Changes appear in other browser tabs via SSE
  - [ ] AuditLog contains roster modification entries

## Dev Notes

### Schema Change (correct-course 2025-11-27)

The DutyRoster model was restructured from generic positions to fixed fields:

**OLD (generic positions):**
```prisma
model DutyRoster {
  weekNumber Int
  year       Int
  position   String   // "vakthavende brannsjef", etc.
  assignedTo String   // Person name
  @@unique([weekNumber, year, position])
}
```

**NEW (fixed fields):**
```prisma
model DutyRoster {
  weekNumber       Int
  year             Int
  vakt09Name       String?  // Vakt09 assigned person
  lederstotteName  String?  // Lederstøtte assigned person
  lederstottePhone String?  // Lederstøtte phone number
  @@unique([weekNumber, year])  // One entry per week
}
```

### API Contract

**GET /api/vaktplan?week=48&year=2025**
```typescript
{
  success: true,
  data: {
    id: string | null,
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
// Request
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

### SSE Event

```typescript
broadcastSSE("vaktplan_update", {
  week: number,
  year: number,
  vakt09Name: string | null,
  lederstotteName: string | null,
  lederstottePhone: string | null
});
```

### References

- [Source: docs/tech-spec-epic-3.md#Story 3.7]
- [Source: docs/PRD.md#FR4.2 - Roster Updates]
- [Source: prisma/schema.prisma#DutyRoster] (updated model)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- Story rewritten for correct-course (2025-11-27)
- Schema changed from generic positions to fixed Vakt09/Lederstøtte fields
- Previous implementation deprecated

### File List

| File | Action |
|------|--------|
| app/api/vaktplan/route.ts | REWRITE |
| app/api/vaktplan/[id]/route.ts | DELETE |
| components/hva-skjer/vaktplan-section.tsx | REWRITE |
| lib/sse.ts | VERIFY (vaktplan_update already added) |

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-27 | Story drafted from tech-spec-epic-3.md | Claude Opus 4.5 |
| 2025-11-27 | Previous implementation deprecated | Claude Opus 4.5 |
| 2025-11-27 | Story rewritten for correct-course | Claude Opus 4.5 |
