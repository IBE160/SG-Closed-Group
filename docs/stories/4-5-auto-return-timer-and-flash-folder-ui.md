# Story 4.5: Auto-Return Timer and Flash Folder UI

Status: skipped

## Story

As a **dispatcher**,
I want to **automatically return to "Hva Skjer" after 5 minutes in Flash folder**,
so that **I don't forget to monitor operational events**.

## Acceptance Criteria

1. **[AC4.5.1]** Auto-switch to "Hva Skjer" after 5 minutes idle in Flash folder
2. **[AC4.5.2]** Timer resets on user interaction (click, type, navigate)
3. **[AC4.5.3]** Manual tab switching cancels the timer
4. **[AC4.5.4]** Flash folder displays both read and write interface

## Tasks / Subtasks

- [ ] **Task 1: Implement 5-minute idle timer using setTimeout**
- [ ] **Task 2: Reset timer on user interaction**
- [ ] **Task 3: Clear timer on manual folder switch**
- [ ] **Task 4: Layout Flash folder with read/write sections**

## Dev Notes

### Why Skipped

Flash-meldinger vises nå i en persistent bar på alle sider, så det er ikke nødvendig med auto-retur logikk. Operatører ser alltid siste flash-melding uansett hvilken fane de er på.

### Technical Notes

- Use React `useEffect` with cleanup for timer
- Reference PRD FR8.2: Default & Auto-Switch Behavior

### References

- [Source: docs/epics.md#Story-4.5]
- [Source: docs/tech-spec-epic-4.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented as skipped | Claude Opus 4.5 |
