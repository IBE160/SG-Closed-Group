# Story 2.4: Protected Routes and API Endpoints

Status: done

## Story

As a **developer**,
I want to **protect all application routes and API endpoints**,
so that **only authenticated users can access the system**.

## Acceptance Criteria

1. **[AC2.4.1]** Unauthenticated users are redirected to login page
2. **[AC2.4.2]** After authentication, users are redirected to intended destination
3. **[AC2.4.3]** All API endpoints require valid session (except public routes)
4. **[AC2.4.4]** Invalid/expired sessions return 401 Unauthorized
5. **[AC2.4.5]** Middleware protects all routes except `/api/auth/*` and public pages

## Tasks / Subtasks

- [x] **Task 1: Create Next.js middleware in middleware.ts**
- [x] **Task 2: Protect all routes except auth and login**
- [x] **Task 3: Check session using getToken() from next-auth/jwt**
- [x] **Task 4: Store intended destination for post-login redirect**
- [x] **Task 5: Test with expired sessions and invalid tokens**

## Dev Notes

### Technical Notes

- Create middleware in `middleware.ts`
- Protect all routes except: `/api/auth/*`, `/login`
- Redirect unauthenticated users to `/login`

### References

- [Source: docs/epics.md#Story-2.4]
- [Source: docs/tech-spec-epic-2.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
