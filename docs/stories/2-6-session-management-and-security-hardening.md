# Story 2.6: Session Management and Security Hardening

Status: done

## Story

As a **security-conscious administrator**,
I want to **have secure sessions with proper expiration and token verification**,
so that **unauthorized access is prevented**.

## Acceptance Criteria

1. **[AC2.6.1]** JWT tokens verified on every request using Google public keys
2. **[AC2.6.2]** Sessions expire after 8 hours of inactivity
3. **[AC2.6.3]** Expired sessions automatically cleared
4. **[AC2.6.4]** Session tokens are httpOnly and sameSite cookies (CSRF protection)
5. **[AC2.6.5]** Security headers configured (CSP, HSTS, X-Frame-Options)

## Tasks / Subtasks

- [x] **Task 1: Configure session maxAge (8 hours)**
- [x] **Task 2: Enable automatic token refresh**
- [x] **Task 3: Configure cookie settings (httpOnly, sameSite, secure)**
- [x] **Task 4: Implement token verification**
- [x] **Task 5: Add security headers in next.config.js**

## Dev Notes

### Technical Notes

- Session maxAge: 28800 (8 hours)
- Cookie settings: `httpOnly: true`, `sameSite: 'lax'`, `secure: true`
- Security headers: Content-Security-Policy, X-Frame-Options: DENY
- Reference PRD NFR: Security

### References

- [Source: docs/epics.md#Story-2.6]
- [Source: docs/tech-spec-epic-2.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
