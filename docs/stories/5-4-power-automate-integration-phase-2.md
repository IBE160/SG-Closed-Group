# Story 5.4: Power Automate Integration (Phase 2 - Email Monitoring)

Status: done

## Story

As an **administrator**,
I want to **have Power Automate monitor the shared mailbox and trigger bonfire processing**,
so that **registrations are processed automatically without dispatcher intervention**.

## Acceptance Criteria

1. **[AC5.4.1]** Power Automate extracts email body and metadata when email arrives
2. **[AC5.4.2]** Flow calls application API endpoint with email content
3. **[AC5.4.3]** Complete registrations auto-create POI without manual approval
4. **[AC5.4.4]** Incomplete registrations flagged for dispatcher review queue

## Tasks / Subtasks

- [x] **Task 1: Create Power Automate flow with email trigger**
- [x] **Task 2: Create /api/bonfires/auto-process endpoint**
- [x] **Task 3: Validate extraction completeness**
- [x] **Task 4: Auto-create bonfire if complete AND high confidence (> 95%)**
- [x] **Task 5: Add to review queue if incomplete or low confidence**

## Dev Notes

### Technical Notes

- Power Automate flow: Email trigger → HTTP POST to `/api/bonfires/auto-process`
- Endpoint receives: email body, subject, sender, municipality folder
- Reference PRD FR5.2: Phase 2 Full Automation

### References

- [Source: docs/epics.md#Story-5.4]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
