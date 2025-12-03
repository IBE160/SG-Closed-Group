# Story 5.2: Manual Bonfire Registration (Baseline)

Status: done

## Story

As a **dispatcher**,
I want to **manually create bonfire registrations from email content**,
so that **we have a baseline system before automation**.

## Acceptance Criteria

1. **[AC5.2.1]** Form appears when clicking "Add Bonfire" button
2. **[AC5.2.2]** Required fields: name, phone, address, municipality, bonfire size, date/time
3. **[AC5.2.3]** Address field uses Google Places Autocomplete
4. **[AC5.2.4]** Address geocoded to lat/lng automatically on submit
5. **[AC5.2.5]** New bonfire appears on map immediately for all dispatchers

## Tasks / Subtasks

- [x] **Task 1: Create /api/bonfires POST endpoint**
- [x] **Task 2: Build form with React Hook Form + Zod validation**
- [x] **Task 3: Integrate Google Places Autocomplete**
- [x] **Task 4: Call Geocoding API to get lat/lng**
- [x] **Task 5: Store bonfire in Azure Table Storage**
- [x] **Task 6: Broadcast via SSE to update all maps**

## Dev Notes

### Technical Notes

- Municipality dropdown: 29 municipalities from config
- Storage: Azure Table Storage (ADR-006)
- Reference PRD FR5.1: Phase 1 (baseline before AI)

### References

- [Source: docs/epics.md#Story-5.2]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
