# Story 5.5: Municipality Filtering and Search

Status: done

## Story

As a **dispatcher**,
I want to **filter bonfires by municipality and search by address**,
so that **I can quickly find relevant registrations for a specific area**.

## Acceptance Criteria

1. **[AC5.5.1]** Municipality dropdown filters map to show only selected municipality
2. **[AC5.5.2]** Search by address or name to find specific bonfires
3. **[AC5.5.3]** Search results highlight matching markers on map
4. **[AC5.5.4]** Filter state persists during session
5. **[AC5.5.5]** "Show All" option clears filters

## Tasks / Subtasks

- [x] **Task 1: Add municipality dropdown (29 options)**
- [x] **Task 2: Implement client-side marker filtering**
- [x] **Task 3: Add search input with autocomplete**
- [x] **Task 4: Highlight/zoom to search results**
- [x] **Task 5: Manage filter state with React**

## Dev Notes

### Technical Notes

- 29 municipalities in Rogaland region
- Client-side filtering for fast response
- Reference PRD FR5.3: Municipality Filter, Search Functionality

### References

- [Source: docs/epics.md#Story-5.5]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
