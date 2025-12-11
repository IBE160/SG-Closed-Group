-- Migration: Add explicit RLS policies for server-only access model
-- Date: 2025-12-11
-- Purpose: Silence RLS linter INFO warnings by creating explicit policies
--
-- Security Model:
-- - These policies explicitly document that ONLY server-side access is allowed
-- - The service_role (used by Prisma) bypasses RLS automatically
-- - The anon and authenticated roles are explicitly denied all access
-- - This prevents any direct PostgREST API access to these tables
--
-- Note: Using 'false' as the policy expression means no rows match,
-- effectively denying all access for the specified roles.

-- ============================================================================
-- User table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "User"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Session table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "Session"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Event table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "Event"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- VehicleStatus table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "VehicleStatus"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- FlashMessage table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "FlashMessage"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- BonfireRegistration table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "BonfireRegistration"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- AuditLog table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "AuditLog"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Talegruppe table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "Talegruppe"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- DutyRoster table policies
-- ============================================================================
CREATE POLICY "Server only - deny public access"
  ON "DutyRoster"
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- All 9 tables now have explicit "deny all" policies for public API access.
-- The service_role used by server-side Prisma bypasses RLS automatically.
-- This silences the "RLS Enabled No Policy" INFO warnings while maintaining
-- the same secure, server-only access model.
-- ============================================================================
