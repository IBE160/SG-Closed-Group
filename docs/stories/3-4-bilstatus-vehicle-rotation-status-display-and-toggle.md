# Story 3.4: Bilstatus - Vehicle Rotation Status Display and Toggle

Status: done

## Story

As a **dispatcher**,
I want to **see and toggle vehicle status for S111 and S112**,
so that **I know which truck is ready for the next call and can update the rotation**.

## Acceptance Criteria

1. **[AC3.4.1]** Two boxes displayed for S111 and S112
2. **[AC3.4.2]** Colors: Green (READY), Red (OUT), Grey (OUT_OF_SERVICE)
3. **[AC3.4.3]** Clicking red truck toggles: clicked→green, paired→red
4. **[AC3.4.4]** Status changes broadcast to all dispatchers < 1 second
5. **[AC3.4.5]** Only one truck can be green at a time (if neither grey)

## Tasks / Subtasks

- [x] **Task 1: Create Bilstatus API endpoint** (AC: 1, 3, 5)
  - [x] Create `/api/bilstatus/route.ts` with GET and PATCH handlers
  - [x] GET: Return current status for both vehicles
  - [x] PATCH: Handle toggle action with mutual exclusivity
  - [x] Add authentication check
  - [x] Implement audit logging

- [x] **Task 2: Initialize VehicleStatus database records** (AC: 1)
  - [x] Auto-create records on first API call (ensureVehiclesExist)
  - [x] Default: S111 = READY (green), S112 = OUT (red)

- [x] **Task 3: Create VehicleStatusBox component** (AC: 1, 2, 3)
  - [x] Display vehicle name (S111/S112) - large, clear
  - [x] Color based on status (green/red/grey)
  - [x] Clickable to toggle (if not grey)
  - [x] Visual feedback on hover/click

- [x] **Task 4: Update BilstatusSection component** (AC: 1, 4)
  - [x] Fetch status from API
  - [x] Render two VehicleStatusBox components
  - [x] Handle SSE updates for real-time sync
  - [x] Loading and error states

- [x] **Task 5: Add SSE broadcast for status changes** (AC: 4)
  - [x] Broadcast `bilstatus_update` event on status change
  - [x] Update UI immediately on SSE event

## Dev Notes

### API Specifications

**GET /api/bilstatus**
```typescript
// Response
{
  success: true,
  data: {
    S111: { status: "READY" | "OUT" | "OUT_OF_SERVICE", note: string | null, updatedAt: string },
    S112: { status: "READY" | "OUT" | "OUT_OF_SERVICE", note: string | null, updatedAt: string }
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

// Response
{
  success: true,
  data: {
    S111: { status: "READY" | "OUT" | "OUT_OF_SERVICE", note: string | null },
    S112: { status: "READY" | "OUT" | "OUT_OF_SERVICE", note: string | null }
  }
}
```

### Toggle Logic

1. User clicks S111 (currently RED)
2. If neither truck is GREY:
   - S111: RED → GREEN
   - S112: GREEN → RED (automatic swap)
3. If one truck is GREY, the other stays green (no toggle allowed on grey)

### Color Mapping

| Status | Color | Tailwind |
|--------|-------|----------|
| READY | Green | `bg-green-500` |
| OUT | Red | `bg-red-500` |
| OUT_OF_SERVICE | Grey | `bg-gray-400` |

### Components to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `app/api/bilstatus/route.ts` | CREATE | Bilstatus API |
| `components/bilstatus/VehicleStatusBox.tsx` | CREATE | Individual vehicle box |
| `components/hva-skjer/bilstatus-section.tsx` | MODIFY | Integrate real data |

### Database Initialization

Need to ensure S111 and S112 records exist before API calls. Options:
1. Seed script during deployment
2. Upsert in API if not exists

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Lint passed with no errors
- API tested successfully

### Completion Notes List

- Auto-initialize vehicle records on first API call
- Clean UI with only vehicle name and color (no status text)
- SSE broadcast on status change for real-time sync
- Polling fallback every 30 seconds

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-27 | Story drafted | Claude Opus 4.5 |
| 2025-11-27 | All tasks implemented | Claude Opus 4.5 |

### File List

| File | Action | Description |
|------|--------|-------------|
| `app/api/bilstatus/route.ts` | CREATED | GET/PATCH API with auto-init and SSE broadcast |
| `components/bilstatus/VehicleStatusBox.tsx` | CREATED | Color-coded vehicle status box |
| `components/hva-skjer/bilstatus-section.tsx` | MODIFIED | Integrated real data with SSE |
