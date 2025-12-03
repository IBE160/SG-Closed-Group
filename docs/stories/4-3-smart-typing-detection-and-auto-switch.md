# Story 4.3: Smart Typing Detection and Auto-Switch

Status: skipped

## Story

As a **dispatcher**,
I want to **avoid being auto-switched to Flash folder if I'm typing**,
so that **I'm not interrupted during critical documentation**.

## Acceptance Criteria

1. **[AC4.3.1]** If actively typing (keyboard activity in last 3 seconds), Flash tab blinks instead of auto-switch
2. **[AC4.3.2]** If NOT typing, system auto-switches to Flash folder immediately
3. **[AC4.3.3]** Typing detection has > 95% accuracy
4. **[AC4.3.4]** Manual tab switching always overrides auto-switch

## Tasks / Subtasks

- [ ] **Task 1: Implement typing detection (track last keypress timestamp)**
- [ ] **Task 2: Add logic: if typing → blink tab, if not → auto-switch**
- [ ] **Task 3: Use React Context to share typing state**
- [ ] **Task 4: Test with multiple scenarios**

## Dev Notes

### Why Skipped

Funksjonaliteten ble vurdert som ikke kritisk for MVP. Full-screen flash med 20-sekunders varighet gir tilstrekkelig oppmerksomhet uten behov for auto-switch logikk.

### Technical Notes

- Track last keypress timestamp
- If `Date.now() - lastKeypressTimestamp < 3000ms` → user is typing
- Reference PRD FR1.3: Smart Auto-Switch

### References

- [Source: docs/epics.md#Story-4.3]
- [Source: docs/tech-spec-epic-4.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented as skipped | Claude Opus 4.5 |
