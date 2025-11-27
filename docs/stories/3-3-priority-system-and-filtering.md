# Story 3.3: Priority System and Filtering

Status: done

## Story

As a **dispatcher**,
I want to **filter events by priority**,
so that **I can focus on critical events when needed**.

## Acceptance Criteria

1. **[AC3.3.1]** Pri 1 events highlighted in red at top of list - ALREADY IMPLEMENTED
2. **[AC3.3.2]** Normal events displayed with standard styling below - ALREADY IMPLEMENTED
3. **[AC3.3.3]** Filter toggle for "All Events" / "Pri 1 Only"
4. **[AC3.3.4]** Filter state persists per user session (localStorage)
5. **[AC3.3.5]** Color-coding meets WCAG contrast requirements

## Tasks / Subtasks

- [x] **Task 1: Priority styling** (AC: 1, 2) - Already done in Story 3.1
  - [x] Pri 1 events have red border, background, and "Pri 1" badge
  - [x] Normal events have standard border styling
  - [x] Events sorted: CRITICAL first, then by createdAt DESC

- [x] **Task 2: Add filter toggle** (AC: 3)
  - [x] Add toggle button/switch in ViktigeMeldinger header
  - [x] Options: "Alle" / "Pri 1"
  - [x] Pass filter state to EventList component
  - [x] Filter events in EventList based on priority

- [x] **Task 3: Persist filter state** (AC: 4)
  - [x] Save filter preference to localStorage
  - [x] Load filter preference on component mount
  - [x] Key: "event-filter-priority"

- [x] **Task 4: Verify WCAG compliance** (AC: 5)
  - [x] Check red text contrast ratio (4.5:1 minimum)
  - [x] Check red badge contrast
  - [x] Ensure focus states are visible

## Dev Notes

### Components to Modify

| File | Action | Purpose |
|------|--------|---------|
| `components/hva-skjer/viktige-meldinger.tsx` | MODIFY | Add filter toggle |
| `components/events/EventList.tsx` | MODIFY | Accept and apply filter prop |

### Filter Implementation

```typescript
// Filter options
type PriorityFilter = "ALL" | "CRITICAL";

// localStorage key
const FILTER_KEY = "event-filter-priority";
```

### WCAG Contrast Requirements

- Normal text: 4.5:1 ratio minimum
- Large text (18px+ or 14px bold): 3:1 ratio minimum
- Current red colors should pass: bg-red-500 (#ef4444) on white bg

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Lint passed with no errors
- Build verification passed

### Completion Notes List

- Filter toggle implemented as button group in ViktigeMeldinger header
- localStorage persistence with key "event-filter-priority"
- EventList accepts priorityFilter prop and filters client-side
- WCAG compliance verified: red-600 text on white has 4.5:1+ contrast
- Empty state messages updated for filtered view

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-27 | Story drafted | Claude Opus 4.5 |
| 2025-11-27 | Tasks 2-4 implemented | Claude Opus 4.5 |

### File List

| File | Action | Description |
|------|--------|-------------|
| `components/hva-skjer/viktige-meldinger.tsx` | MODIFIED | Added filter toggle and localStorage persistence |
| `components/events/EventList.tsx` | MODIFIED | Added priorityFilter prop with client-side filtering |
