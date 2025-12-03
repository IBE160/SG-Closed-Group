# Story 4.4: Message History and Multiple Messages

Status: done

## Story

As a **dispatcher**,
I want to **see recent flash messages and navigate between them**,
so that **I don't miss information if multiple messages arrive quickly**.

## Acceptance Criteria

1. **[AC4.4.1]** Display the 3 most recent messages in Flash folder
2. **[AC4.4.2]** Can scroll/paginate to view older messages
3. **[AC4.4.3]** Newest message displayed first
4. **[AC4.4.4]** Unread messages visually distinguished from read
5. **[AC4.4.5]** Messages persist for 24 hours, then auto-archive

## Tasks / Subtasks

- [x] **Task 1: Display messages newest first (ORDER BY createdAt DESC)**
- [x] **Task 2: Limit initial display to 3-5 messages**
- [x] **Task 3: Mark messages as read when viewed**
- [x] **Task 4: Style unread vs read differently**
- [x] **Task 5: Auto-archive messages > 24 hours**

## Dev Notes

### Implementation Notes

Implementert via useFlashStore med messages array og currentIndex navigasjon. Flash-bar viser siste meldinger med mulighet for navigasjon.

### References

- [Source: docs/epics.md#Story-4.4]
- [Source: docs/tech-spec-epic-4.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
