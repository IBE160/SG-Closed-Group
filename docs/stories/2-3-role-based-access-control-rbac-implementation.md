# Story 2.3: Role-Based Access Control (RBAC) Implementation

Status: done

## Story

As an **administrator**,
I want to **assign roles (Operator or Administrator) to users**,
so that **permissions are enforced based on user responsibilities**.

## Acceptance Criteria

1. **[AC2.3.1]** Role is stored in User table when administrator assigns it
2. **[AC2.3.2]** Operator role can: view, create, edit own content, toggle bilstatus
3. **[AC2.3.3]** Administrator role has all operator permissions + delete, manage users, view audit logs
4. **[AC2.3.4]** Role is included in JWT session for fast authorization checks
5. **[AC2.3.5]** API endpoints enforce role-based permissions server-side

## Tasks / Subtasks

- [x] **Task 1: Add role enum to User table (OPERATOR, ADMINISTRATOR)**
- [x] **Task 2: Include role in NextAuth session object**
- [x] **Task 3: Create authorization middleware: requireRole()**
- [x] **Task 4: Protect API routes with role checks (403 Forbidden)**
- [x] **Task 5: Hide admin-only UI features from operators**

## Dev Notes

### Technical Notes

- Role enum: `OPERATOR`, `ADMINISTRATOR`
- Always enforce permissions server-side (don't rely on UI hiding)
- Reference PRD FR6.3: Role-Based Permissions

### References

- [Source: docs/epics.md#Story-2.3]
- [Source: docs/tech-spec-epic-2.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
