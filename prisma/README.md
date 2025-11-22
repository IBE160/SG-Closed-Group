# Database Setup Guide

## Story 1.2: Database Schema Design and Prisma Setup

This document provides instructions for setting up the PostgreSQL database and running migrations.

## Prerequisites

- PostgreSQL database (local or Vercel Postgres)
- Node.js 22.x installed
- Prisma CLI 6.x installed (already in package.json)

## Database Options

### Option 1: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb hva_skjer
   ```
3. Update `.env.local` with your local database URL:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/hva_skjer?schema=public"
   ```

### Option 2: Vercel Postgres (Recommended for Production)

1. Go to your Vercel project dashboard
2. Navigate to Storage > Create Database > Postgres
3. Copy the DATABASE_URL from Vercel
4. Update `.env.local` with the Vercel Postgres URL

## Running Migrations

Once you have configured your DATABASE_URL in `.env.local`:

```bash
# Create and apply the initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create migration files in prisma/migrations/
# 2. Apply the migration to your database
# 3. Generate Prisma Client types
```

## Verify Database Schema

After running migrations, verify all 8 tables were created:

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

Prisma Studio will open at http://localhost:5555

**Expected Tables:**
1. User - Authentication and RBAC
2. Session - NextAuth.js sessions
3. Event - Operational events
4. FlashMessage - Urgent dispatcher communication
5. VehicleStatus - Truck rotation (S111, S112)
6. DutyRoster - Weekly personnel assignments
7. BonfireRegistration - Bonfire notifications
8. AuditLog - Complete action history

## Database Schema Summary

### Models
- **User**: id (UUID), email (unique), name, whitelisted, role, timestamps
- **Session**: id (UUID), userId (FK), sessionToken (unique), expires, timestamps
- **Event**: id (UUID), title, description, priority, status, createdBy, timestamps, soft delete
- **FlashMessage**: id (UUID), content, createdBy, createdAt, expiresAt
- **VehicleStatus**: id (UUID), vehicleId (unique), status, note, updatedBy, updatedAt
- **DutyRoster**: id (UUID), weekNumber, year, position, assignedTo, timestamps
- **BonfireRegistration**: id (UUID), registrantName, phone, address, lat/lng, municipality, dates, status, source, soft delete
- **AuditLog**: id (UUID), userId, userEmail, timestamp, tableName, recordId, actionType, oldValues/newValues (JSONB)

### Enums
- **Role**: OPERATOR, ADMINISTRATOR
- **Priority**: CRITICAL, NORMAL
- **EventStatus**: ACTIVE, RESOLVED, ARCHIVED
- **VehicleStatusType**: READY, OUT, OUT_OF_SERVICE
- **BonfireStatus**: ACTIVE, EXPIRED, FLAGGED_FOR_REVIEW
- **BonfireSource**: MANUAL, AI_APPROVED, AI_REVIEWED

## Key Features

- **UUID Primary Keys**: Non-sequential, better security
- **Timestamps**: createdAt/updatedAt on all relevant tables
- **Soft Deletes**: deletedAt on Event and BonfireRegistration for GDPR compliance
- **JSONB Fields**: Audit snapshots in AuditLog for flexible querying
- **Composite Indexes**: Optimized for frequently queried combinations
- **Foreign Keys**: User 1:N Session relationship with cascade delete

## Troubleshooting

### Migration fails with "Environment variable not found"
Make sure `.env.local` exists and contains a valid DATABASE_URL.

### Connection timeout
Check your PostgreSQL server is running and accessible at the specified host/port.

### Schema out of sync
Run `npx prisma migrate reset` to reset the database and re-apply all migrations (WARNING: destroys all data).

## Next Steps

After setting up the database:
1. Run migrations: `npx prisma migrate dev --name init`
2. Verify with Prisma Studio: `npx prisma studio`
3. Commit migration files to Git
4. Continue with Story 1.3: Tailwind CSS and shadcn/ui Component Library Setup
