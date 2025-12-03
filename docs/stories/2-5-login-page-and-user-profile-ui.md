# Story 2.5: Login Page and User Profile UI

Status: done

## Story

As a **dispatcher**,
I want to **have a professional login page and user profile display**,
so that **I can authenticate and see my account information**.

## Acceptance Criteria

1. **[AC2.5.1]** Professional login page with "Sign in with Google" button
2. **[AC2.5.2]** Clicking button redirects to Google OAuth consent screen
3. **[AC2.5.3]** After authorization, user is redirected to the application
4. **[AC2.5.4]** User name and email displayed in UI header/nav
5. **[AC2.5.5]** Logout button is clearly visible and functional

## Tasks / Subtasks

- [x] **Task 1: Create /login page with shadcn/ui components**
- [x] **Task 2: Implement signIn('google') authentication**
- [x] **Task 3: Display user info in navigation**
- [x] **Task 4: Implement logout using signOut()**
- [x] **Task 5: Style login page with emergency services aesthetic**

## Dev Notes

### Technical Notes

- Use NextAuth `signIn('google')` for authentication
- Display user info: name, email, role
- Login page matches emergency services aesthetic

### References

- [Source: docs/epics.md#Story-2.5]
- [Source: docs/tech-spec-epic-2.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
