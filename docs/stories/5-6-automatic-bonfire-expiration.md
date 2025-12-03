# Story 5.6: Automatic Bonfire Expiration

Status: done

## Story

As a **system administrator**,
I want to **have bonfires automatically expire and be removed from the map**,
so that **dispatchers only see current registrations**.

## Acceptance Criteria

1. **[AC5.6.1]** Expired bonfires removed from map when cleanup job runs
2. **[AC5.6.2]** Expired data retained for 90 days before permanent deletion (GDPR)
3. **[AC5.6.3]** Expiration runs automatically (daily at 04:00)
4. **[AC5.6.4]** Audit logs track expiration and deletion actions

## Tasks / Subtasks

- [x] **Task 1: Create /api/cron/expire-bonfires endpoint**
- [x] **Task 2: Schedule with Vercel Cron Jobs (daily at 04:00)**
- [x] **Task 3: Query expired bonfires (date_to < NOW())**
- [x] **Task 4: Set status to EXPIRED (soft delete)**
- [x] **Task 5: Permanent deletion after 90 days (GDPR)**
- [x] **Task 6: Broadcast map updates**

## Dev Notes

### Implementation Notes

Nightly cleanup job kjører kl 04:00 og filtrerer ut utgåtte bål fra kartet uten å slette fra storage. Sletting skjer etter 90 dager for GDPR-compliance.

### Technical Notes

- Query: `WHERE date_to < NOW() AND status = 'ACTIVE'`
- Reference PRD FR5.4: Automatic Expiration, NFR: GDPR Compliance

### References

- [Source: docs/epics.md#Story-5.6]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
