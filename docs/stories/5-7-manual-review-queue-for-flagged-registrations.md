# Story 5.7: Manual Review Queue for Flagged Registrations

Status: done

## Story

As a **dispatcher**,
I want to **see and process bonfire registrations flagged by AI as incomplete**,
so that **all registrations are handled even if automation fails**.

## Acceptance Criteria

1. **[AC5.7.1]** List of flagged registrations with extracted data and confidence scores
2. **[AC5.7.2]** Can edit and complete missing fields
3. **[AC5.7.3]** Can approve registration to create POI
4. **[AC5.7.4]** Can reject registration if spam/invalid
5. **[AC5.7.5]** Review queue accessible only to authenticated dispatchers

## Tasks / Subtasks

- [x] **Task 1: Create /api/bonfires/review-queue GET endpoint**
- [x] **Task 2: Add "Review Queue" section in Bålmelding folder**
- [x] **Task 3: Display table with registration data and confidence**
- [x] **Task 4: Provide edit form for each flagged registration**
- [x] **Task 5: Implement Approve, Edit & Approve, Reject actions**

## Dev Notes

### Technical Notes

- Actions: Approve (create POI), Edit & Approve, Reject (mark as invalid)
- Filter queue: show only pending reviews
- Reference PRD FR5.2: Manual Review Queue

### References

- [Source: docs/epics.md#Story-5.7]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
