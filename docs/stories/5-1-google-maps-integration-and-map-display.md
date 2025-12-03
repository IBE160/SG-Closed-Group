# Story 5.1: Google Maps Integration and Map Display

Status: done

## Story

As a **dispatcher**,
I want to **see an interactive Google Map with bonfire POI markers**,
so that **I can quickly verify if a reported fire is a registered bonfire**.

## Acceptance Criteria

1. **[AC5.1.1]** Interactive Google Map displayed in Bålmelding folder
2. **[AC5.1.2]** Registered bonfires displayed as POI markers
3. **[AC5.1.3]** Clicking marker shows contact details (name, phone, address, size, date/time)
4. **[AC5.1.4]** Map supports zoom, pan, and standard interactions
5. **[AC5.1.5]** Map loads in < 2 seconds

## Tasks / Subtasks

- [x] **Task 1: Install @vis.gl/react-google-maps**
- [x] **Task 2: Create /balmelding page with Google Maps component**
- [x] **Task 3: Configure Google Maps API key**
- [x] **Task 4: Create /api/bonfires GET endpoint (Azure Table Storage)**
- [x] **Task 5: Render markers with info windows**
- [x] **Task 6: Center map on Rogaland region**

## Dev Notes

### Architecture Note (ADR-006)

Epic 5 uses **Azure Table Storage** instead of PostgreSQL/Prisma for bonfire data storage. This enables parallel development and leverages Azure Student subscription.

### Technical Notes

- Use `@vis.gl/react-google-maps` library
- Storage: Azure Table Storage via `lib/azure-table.ts`
- Reference PRD FR5.3: Google Maps Integration

### References

- [Source: docs/epics.md#Story-5.1]
- [Source: docs/architecture.md#ADR-006]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
