# Story 3.5: Bilstatus - Grey Status with Notes

Status: done

## Story

As a **dispatcher**,
I want to **mark a vehicle as out of service with a reason**,
so that **other dispatchers know why a vehicle is unavailable**.

## Acceptance Criteria

1. **[AC3.5.1]** Right-click shows context menu with "Sett ute av drift" ✅
2. **[AC3.5.2]** Dialog requires reason note before setting grey ✅
3. **[AC3.5.3]** Grey truck displays note text ✅
4. **[AC3.5.4]** Paired truck automatically becomes green ✅
5. **[AC3.5.5]** Can edit note or cancel grey status via context menu ✅

## Tasks / Subtasks

- [x] **Task 1: Update API for grey status actions** (AC: 2, 4, 5)
  - [x] Add `set_grey` action with required note
  - [x] Add `clear_grey` action to restore normal status
  - [x] Paired truck becomes green when one is set grey
  - [x] Audit logging for grey status changes

- [x] **Task 2: Add context menu to VehicleStatusBox** (AC: 1, 5)
  - [x] Right-click opens context menu
  - [x] Menu options: "Sett ute av drift" / "Fjern ute av drift"
  - [x] Show "Rediger notat" when already grey

- [x] **Task 3: Create grey status dialog** (AC: 2)
  - [x] Dialog with note input field
  - [x] Note is required (cannot submit empty)
  - [x] Submit calls API with set_grey action

- [x] **Task 4: Display note on grey vehicle** (AC: 3)
  - [x] Show note text below vehicle name
  - [x] Text should be readable on grey background

- [x] **Task 5: Test and verify** (AC: 1-5)
  - [x] Manual test: Right-click, set grey with note
  - [x] Manual test: Clear grey status
  - [x] Manual test: Edit note on grey vehicle

## Business Rules (Clarified)

### Grey Status Logic

1. **Set grey**: When a vehicle is set to grey (out of service):
   - The vehicle becomes grey with required note
   - The other vehicle ALWAYS becomes green
   - Cannot set grey if the other vehicle is already grey (error shown to user)

2. **Clear grey**: When grey status is removed:
   - The vehicle ALWAYS becomes red
   - The other vehicle keeps its status (stays green)

3. **Mutual exclusivity**: Only one vehicle can be grey at a time (at least one must be ready for calls - per tech-spec "Business rule prevents this")

### State Transitions

| Action | Target Vehicle | Other Vehicle |
|--------|---------------|---------------|
| set_grey | → GREY | → GREEN |
| clear_grey | → RED | unchanged |
| set_grey (blocked) | error | already GREY |

## Dev Notes

### API Updates

**PATCH /api/bilstatus - set_grey**
```typescript
{
  vehicle: "S111" | "S112",
  action: "set_grey",
  note: string  // Required, 1-50 chars
}
```

**PATCH /api/bilstatus - clear_grey**
```typescript
{
  vehicle: "S111" | "S112",
  action: "clear_grey"
}
```

### Context Menu Options

| Current Status | Menu Options |
|---------------|--------------|
| READY (green) | "Sett ute av drift" |
| OUT (red) | "Sett ute av drift" |
| OUT_OF_SERVICE (grey) | "Rediger notat", "Fjern ute av drift" |

### Components to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `app/api/bilstatus/route.ts` | MODIFY | Add set_grey and clear_grey actions |
| `components/bilstatus/VehicleStatusBox.tsx` | MODIFY | Add context menu |
| `components/bilstatus/GreyStatusDialog.tsx` | CREATE | Dialog for note input |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes

**Completed:** 2025-11-27
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-27 | Story drafted | Claude Opus 4.5 |
| 2025-11-27 | Implementation complete - all AC verified working | Claude Opus 4.5 |
