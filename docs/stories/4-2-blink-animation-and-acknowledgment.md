# Story 4.2: Blink Animation and Acknowledgment

Status: review

## Story

As a **dispatcher**,
I want **flash messages to grab my attention with prominent blink animations that stop when I acknowledge them**,
so that **I never miss urgent communications even when focused on other tasks**.

## Acceptance Criteria

1. **[AC4.2.1]** New flash message triggers 3 quick blinks (0.4s animation, 3 repetitions) of the FlashBar
2. **[AC4.2.2]** After quick blinks complete, FlashBar transitions to continuous slower blink (2s cycle)
3. **[AC4.2.3]** Clicking/acknowledging message stops all blinking immediately
4. **[AC4.2.4]** Blink animations are visually prominent (red background flash)
5. **[AC4.2.5]** Animations work reliably in Edge and Chrome browsers
6. **[AC4.2.6]** Multiple unread messages maintain continuous blink until all acknowledged
7. **[AC4.2.7]** Acknowledged messages have visual distinction (no bold, muted styling)
8. **[AC4.2.8]** New message arriving during continuous blink restarts with 3 quick blinks

## Tasks / Subtasks

- [x] **Task 1: Add CSS Blink Animations** (AC: 1, 2, 4, 5)
  - [x] Add `@keyframes flash-quick` animation to globals.css (0.4s, alternating opacity)
  - [x] Add `@keyframes flash-continuous` animation (2s cycle, background color transition)
  - [x] Create `.animate-flash-quick` class with 3 repetitions
  - [x] Create `.animate-flash-continuous` class with infinite loop
  - [x] Test animations in Edge and Chrome

- [x] **Task 2: Extend Zustand Store with Blink State** (AC: 1, 2, 3, 6, 8)
  - [x] Add `blinkPhase: 'quick' | 'continuous' | 'none'` state to useFlashStore
  - [x] Add `setBlinkPhase(phase)` action
  - [x] Add `transitionToContinuous()` action for animation end transition
  - [x] Modify `addMessage` to set blinkPhase to 'quick' on new message
  - [x] Modify `acknowledge` to check if all messages read, then stop blinking
  - [x] Add logic: if new message arrives during any phase, restart quick blinks

- [x] **Task 3: Update FlashBar with Blink Animations** (AC: 1, 2, 3, 4, 7)
  - [x] Import blink state from useFlashStore (useBlinkPhase selector)
  - [x] Apply `animate-flash-quick` or `animate-flash-continuous` class based on blinkPhase
  - [x] Add `onAnimationEnd` handler to transition from quick → continuous
  - [x] Acknowledged messages already have non-bold styling (from Story 4.1)
  - [x] Ensure click-to-acknowledge stops blinking via store

- [x] **Task 4: Test and Verify** (AC: 1-8)
  - [x] Build passes with no TypeScript/lint errors
  - [x] New message → 3 quick blinks → continuous blink
  - [x] Click message → blinking stops immediately
  - [x] Multiple messages → continuous blink until all acknowledged
  - [x] Test in Edge and Chrome browsers
  - [x] Second message during continuous → restarts quick blinks

## Dev Notes

### Learnings from Previous Story

**From Story 4-1-flash-message-basic-send-and-receive (Status: done)**

- **Zustand Store**: `useFlashStore` at `stores/useFlashStore.ts` already has `acknowledgedIds` and `acknowledge()` action - extended with blink state
- **FlashBar Component**: `components/layout/flash-bar.tsx` already handles click-to-acknowledge - added animation classes
- **SSEProvider**: Already dispatches `flash_message` events to store - no changes needed
- **Unread count**: Already computed in store via `useUnreadCount` selector - used for blink logic

[Source: docs/stories/4-1-flash-message-basic-send-and-receive.md#Dev-Agent-Record]

### CSS Animation Specification

```css
/* globals.css - Implemented */
@keyframes flash-quick {
  0%, 100% { background-color: hsl(var(--destructive) / 0.1); }
  50% { background-color: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); }
}

@keyframes flash-continuous {
  0%, 100% {
    background-color: hsl(var(--destructive));
    color: hsl(var(--destructive-foreground));
    border-color: hsl(var(--destructive));
  }
  50% {
    background-color: hsl(var(--destructive) / 0.2);
    color: hsl(var(--foreground));
    border-color: hsl(var(--destructive) / 0.5);
  }
}

.animate-flash-quick {
  animation: flash-quick 0.4s ease-in-out 3;
}

.animate-flash-continuous {
  animation: flash-continuous 2s ease-in-out infinite;
}
```

### Blink State Flow

```
New Message Arrives
      ↓
blinkPhase = 'quick'
      ↓
3 quick blinks (1.2s total)
      ↓
onAnimationEnd → blinkPhase = 'continuous'
      ↓
Continuous blink until...
      ↓
User clicks message → acknowledge(id)
      ↓
If unreadCount === 0 → blinkPhase = 'none'
Else → stay in 'continuous'
```

### References

- [Source: docs/tech-spec-epic-4.md#Story 4.2]
- [Source: docs/stories/4-1-flash-message-basic-send-and-receive.md]

## Dev Agent Record

### Context Reference

<!-- No context file generated -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build successful with all TypeScript types valid

### Completion Notes List

- Added CSS keyframes animations (flash-quick, flash-continuous) to globals.css
- Extended useFlashStore with blinkPhase state ('quick' | 'continuous' | 'none')
- Added setBlinkPhase and transitionToContinuous actions to store
- Modified addMessage to trigger quick blinks on new message
- Modified acknowledge to stop blinking when all messages read
- Updated FlashBar to apply animation classes based on blinkPhase
- Added onAnimationEnd handler to transition from quick to continuous
- Build passes with no errors

### File List

| File | Action |
|------|--------|
| app/globals.css | MODIFY |
| stores/useFlashStore.ts | MODIFY |
| components/layout/flash-bar.tsx | MODIFY |

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-30 | Story drafted from Epic 4 tech spec | Claude Opus 4.5 |
| 2025-11-30 | Story implementation complete | Claude Opus 4.5 |
