-- Migration: Enable Row Level Security (RLS) on all public tables
-- Date: 2025-12-11
-- Purpose: Fix security vulnerability - tables exposed to PostgREST without RLS
--
-- Security Model:
-- - All database operations go through server-side Prisma (uses service_role or direct connection)
-- - service_role bypasses RLS by default in Supabase
-- - anon role (public API) should have NO access to these tables
-- - By enabling RLS with no policies, we block all anon access
--
-- Tables affected:
-- 1. User - Authentication and RBAC
-- 2. Session - NextAuth.js JWT sessions
-- 3. Event - Operational events
-- 4. VehicleStatus - Truck rotation status
-- 5. FlashMessage - Urgent dispatcher communication
-- 6. BonfireRegistration - Bonfire notifications
-- 7. AuditLog - Complete action history for compliance
-- 8. Talegruppe - Radio talk group assignments
-- 9. DutyRoster - Weekly personnel assignments

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

-- User table - contains authentication and role data
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Session table - contains user session tokens
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Event table - operational events data
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;

-- VehicleStatus table - vehicle/truck status
ALTER TABLE "VehicleStatus" ENABLE ROW LEVEL SECURITY;

-- FlashMessage table - urgent messages
ALTER TABLE "FlashMessage" ENABLE ROW LEVEL SECURITY;

-- BonfireRegistration table - bonfire notifications with PII
ALTER TABLE "BonfireRegistration" ENABLE ROW LEVEL SECURITY;

-- AuditLog table - sensitive audit trail
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Talegruppe table - radio talk groups
ALTER TABLE "Talegruppe" ENABLE ROW LEVEL SECURITY;

-- DutyRoster table - personnel assignments
ALTER TABLE "DutyRoster" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- NOTES:
-- ============================================================================
--
-- With RLS enabled and NO policies defined:
-- - anon role: BLOCKED (no access via PostgREST public API)
-- - authenticated role: BLOCKED (if using Supabase Auth client-side)
-- - service_role: ALLOWED (bypasses RLS - used by server-side Prisma)
--
-- This is the correct security posture for this application because:
-- 1. All legitimate database operations go through Next.js API routes
-- 2. API routes use Prisma which connects with service_role privileges
-- 3. NextAuth.js handles authentication at the application layer
-- 4. No client-side Supabase SDK is used for database operations
--
-- If you need to add client-side Supabase access in the future,
-- you'll need to create appropriate RLS policies for the authenticated role.
-- ============================================================================
