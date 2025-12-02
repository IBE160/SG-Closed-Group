# Story 1.2: Database Schema Design and Prisma Setup

Status: done

## Story

As a developer,
I want to design the complete database schema and configure Prisma ORM,
So that all features have a consistent data layer.

## Acceptance Criteria

1. **AC-1.2.1:** All 8 tables are created in PostgreSQL: User, Event, FlashMessage, VehicleStatus, DutyRoster, BonfireRegistration, AuditLog, Session
2. **AC-1.2.2:** Relationships between tables are properly defined with foreign keys and cascade deletes where appropriate
3. **AC-1.2.3:** Indexes are created for frequently queried fields (dates, status, municipality, email)
4. **AC-1.2.4:** Prisma Client is generated and TypeScript types are available in node_modules/@prisma/client
5. **AC-1.2.5:** Database migrations are version controlled in prisma/migrations folder
6. **AC-1.2.6:** Prisma schema uses UUID primary keys, createdAt/updatedAt timestamps, and proper enum types
7. **AC-1.2.7:** Database connection URL is configured via DATABASE_URL environment variable
8. **AC-1.2.8:** Prisma Studio can be used to inspect all tables and verify schema correctness

## Tasks / Subtasks

- [x] **Task 1: Configure Prisma and Database Connection** (AC: 1.2.7)
  - [x] 1.1: Verify Prisma is installed (`@prisma/client` and `prisma` dev dependency)
  - [x] 1.2: Set up DATABASE_URL in .env.example with PostgreSQL connection string format
  - [x] 1.3: Create .env.local with actual database credentials (Vercel Postgres or local PostgreSQL)
  - [x] 1.4: Verify `prisma/schema.prisma` file exists and has correct datasource configuration

- [x] **Task 2: Define Complete Database Schema** (AC: 1.2.1, 1.2.6)
  - [x] 2.1: Define User model with id (UUID), email (unique), name, whitelisted (Boolean), role (enum)
  - [x] 2.2: Define Session model for NextAuth.js with sessionToken (unique), userId (FK), expires
  - [x] 2.3: Define Event model with id, title, description, priority (enum), status (enum), createdBy, timestamps
  - [x] 2.4: Define FlashMessage model with id, content, createdBy, createdAt, expiresAt
  - [x] 2.5: Define VehicleStatus model with id, vehicleId (unique), status (enum), note, updatedBy, updatedAt
  - [x] 2.6: Define DutyRoster model with id, weekNumber, year, position, assignedTo, unique constraint
  - [x] 2.7: Define BonfireRegistration model with all fields (name, phone, address, lat/lng, municipality, dates, status, source)
  - [x] 2.8: Define AuditLog model with userId, userEmail, timestamp, tableName, recordId, actionType, oldValues (Json), newValues (Json)
  - [x] 2.9: Add all enum types: Role, Priority, EventStatus, VehicleStatusType, BonfireStatus, BonfireSource

- [x] **Task 3: Define Relationships and Foreign Keys** (AC: 1.2.2)
  - [x] 3.1: Add User 1:N Session relationship with cascade delete
  - [x] 3.2: Reference User.id in Event.createdBy (string, not FK for flexibility)
  - [x] 3.3: Reference User.id in FlashMessage.createdBy
  - [x] 3.4: Reference User.id in VehicleStatus.updatedBy
  - [x] 3.5: Reference User.id in DutyRoster.updatedBy (if applicable)
  - [x] 3.6: Verify all foreign keys have appropriate onDelete behavior (Cascade for sessions)

- [x] **Task 4: Add Indexes for Performance** (AC: 1.2.3)
  - [x] 4.1: Add index on User.email (unique already indexed, verify @@index if needed)
  - [x] 4.2: Add composite index on Event: [priority, createdAt] and [status]
  - [x] 4.3: Add index on FlashMessage.createdAt
  - [x] 4.4: Add index on VehicleStatus.vehicleId
  - [x] 4.5: Add composite index on DutyRoster: [weekNumber, year]
  - [x] 4.6: Add composite indexes on BonfireRegistration: [municipality, dateFrom], [status, expiresAt], [lat, lng], [address, dateFrom]
  - [x] 4.7: Add indexes on AuditLog: [timestamp DESC], [tableName], [userId]

- [x] **Task 5: Run Database Migrations** (AC: 1.2.5)
  - [x] 5.1: Run `npx prisma migrate dev --name init` to create initial migration
  - [x] 5.2: Verify migration files are created in prisma/migrations folder
  - [x] 5.3: Verify migration applied successfully to database
  - [x] 5.4: Check that all 8 tables exist in database
  - [x] 5.5: Commit migration files to Git

- [x] **Task 6: Generate Prisma Client and Verify Types** (AC: 1.2.4)
  - [x] 6.1: Run `npx prisma generate` to generate Prisma Client
  - [x] 6.2: Verify TypeScript types available in node_modules/@prisma/client
  - [x] 6.3: Create or verify lib/prisma.ts singleton pattern for Prisma Client
  - [x] 6.4: Test Prisma Client connection with simple query (e.g., count users)
  - [x] 6.5: Verify TypeScript autocomplete works for all models in IDE

- [x] **Task 7: Verify Schema with Prisma Studio** (AC: 1.2.8)
  - [x] 7.1: Run `npx prisma studio` to open Prisma Studio UI
  - [x] 7.2: Verify all 8 tables visible in Studio
  - [x] 7.3: Verify schema relationships display correctly
  - [x] 7.4: Test CRUD operations in Studio (optional: create test user)
  - [x] 7.5: Document Prisma Studio URL for team reference (usually http://localhost:5555)

## Dev Notes

### Architecture Patterns and Constraints

**From architecture.md:**
- PostgreSQL via Vercel Postgres (free tier: 256 MB storage, sufficient for 4-6 users)
- Prisma ORM 6.x with type-safe queries
- UUID primary keys (non-sequential, better security)
- Timestamps: `createdAt`, `updatedAt` on all relevant tables
- Soft deletes with `deletedAt` timestamps (GDPR compliance)
- JSONB fields for audit snapshots (flexible, queryable)
- Connection pooling (Prisma default, max 10 connections for serverless)

**From tech-spec-epic-1.md:**
- 8 core tables specified: User, Event, FlashMessage, VehicleStatus, DutyRoster, BonfireRegistration, AuditLog, Session
- VARCHAR length constraints based on real-world maximums (email = 100 chars, phone = 20 chars)
- Composite indexes for frequently queried combinations (municipality + date + status)
- Prisma middleware will be added in Story 1.8 for automatic audit logging

### Project Structure Notes

**From Story 1.1 learnings:**
- Project uses `app/` directory at root level (NOT inside `src/`)
- `prisma/` folder already exists with initial schema.prisma file
- Database schema defined but likely needs updates to match full tech spec
- Import alias `@/*` maps to project root

**Database Location:**
- Development: Can use local PostgreSQL or Vercel Postgres free tier
- Production: Vercel Postgres (configured via Vercel dashboard)
- Connection string format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

**Key Files:**
- `prisma/schema.prisma` - Main database schema definition
- `prisma/migrations/` - Version-controlled migration files
- `lib/prisma.ts` - Prisma Client singleton (create if not exists)
- `.env.local` - Local DATABASE_URL (not committed)
- `.env.example` - Template DATABASE_URL example

### Learnings from Previous Story (1.1)

**From Story 1-1-project-initialization-and-repository-setup.md:**

- **Project Structure**: Uses `app/` at root level (NOT `src/`), confirmed by Senior Developer Review
- **Existing Files Verified**:
  - `prisma/schema.prisma` - Database schema already defined (needs verification against tech-spec)
  - `.env.example` - Environment template exists, includes DATABASE_URL
  - `next.config.mjs` - Production-ready configuration with standalone output
  - `package.json` - All dependencies correct (verify Prisma version)

- **Development Environment**:
  - Node.js v22.19.0 (meets requirement)
  - Next.js 14.2.15 with App Router
  - TypeScript 5.9.3 with strict mode enabled
  - Build, lint, and type-check all passing

- **Warnings/Recommendations**:
  - Documentation sometimes references `src/` directory but actual implementation uses `app/` at root
  - Ensure consistency in this story's implementation notes

- **Prisma-Specific Context**:
  - `@prisma/client@^5.22.0` and `prisma@^5.22.0` already installed (verify version matches tech-spec requirement of Prisma 6.x - may need upgrade)
  - Schema file exists, but needs verification against complete tech-spec requirements
  - No migrations run yet (first migration will be created in this story)

**Action Items for This Story**:
1. Verify existing `prisma/schema.prisma` matches tech-spec Epic 1 complete schema
2. Check Prisma version (tech-spec specifies 6.x, package.json shows 5.22.0) - upgrade if needed
3. Ensure DATABASE_URL template in .env.example is PostgreSQL format
4. Create `lib/prisma.ts` singleton if it doesn't exist
5. Run first migration to create all tables
6. Verify no leftover `src/` references in schema comments or configuration

### References

**Technical Specification:**
- [Source: docs/stories/tech-spec-epic-1.md#Data Models and Contracts]
  - Complete Prisma schema lines 98-260
  - All 8 table definitions with relationships, enums, and indexes
  - UUID primary keys, composite indexes, JSONB fields for audit logs

**Architecture Documentation:**
- [Source: docs/architecture.md#Data Architecture]
  - Prisma ORM pattern and singleton usage (lines 1575-1751)
  - Database connection pooling for serverless
  - Index strategy for performance-critical queries (lines 1760-1768)

**Epic Breakdown:**
- [Source: docs/epics.md#Story 1.2]
  - Story definition lines 74-101
  - Acceptance criteria for 8 tables, relationships, indexes, migrations

**PRD Reference:**
- Data requirements from original proposal specify all entities and relationships
- GDPR compliance requires soft deletes and audit trails

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

**Completed:** 2025-11-22
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing

### File List
