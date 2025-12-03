# Story 2.2: User Whitelist Management System

Status: done

## Story

As an **administrator**,
I want to **manage which Google account emails can access the operator system**,
so that **only authorized dispatchers can use the application**.

## Acceptance Criteria

1. **[AC2.2.1]** System checks if user's email is in whitelist after Google authentication succeeds
2. **[AC2.2.2]** Whitelisted users are granted access to the application
3. **[AC2.2.3]** Non-whitelisted users see "Access Denied" message with contact information
4. **[AC2.2.4]** User record is created/updated in database on successful whitelist check
5. **[AC2.2.5]** Administrators can add/remove emails from whitelist via UI

## Tasks / Subtasks

- [x] **Task 1: Implement whitelist check in NextAuth callbacks**
- [x] **Task 2: Create whitelist API endpoints (GET, POST, DELETE)**
- [x] **Task 3: Build admin UI for whitelist management**
- [x] **Task 4: Create "Access Denied" page with admin contact info**
- [x] **Task 5: Log whitelist denials for security monitoring**

## Dev Notes

### Technical Notes

- Add `whitelisted` boolean field to User table
- Implement whitelist check in NextAuth callbacks
- Create `/api/admin/whitelist` endpoints
- Display clear "Access Denied" page with administrator contact info
- Reference PRD FR6.2: Whitelist-Based Access

### References

- [Source: docs/epics.md#Story-2.2]
- [Source: docs/tech-spec-epic-2.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
