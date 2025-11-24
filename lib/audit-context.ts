/**
 * Audit Context Provider
 * Uses AsyncLocalStorage to pass user context through async operations
 * This allows Prisma middleware to access user info for audit logging
 */

import { AsyncLocalStorage } from "async_hooks";

// User context for audit logging
export interface AuditUser {
  id: string;
  email: string;
}

// Audit context stored in AsyncLocalStorage
interface AuditContext {
  user: AuditUser | null;
}

// Create AsyncLocalStorage instance for request-scoped context
const auditStorage = new AsyncLocalStorage<AuditContext>();

/**
 * Run a function with audit context
 * Use this in API route handlers to set user context for audit logging
 *
 * @example
 * ```ts
 * // In API route
 * const session = await auth();
 * return runWithAuditContext(
 *   { id: session.user.id, email: session.user.email },
 *   async () => {
 *     // Prisma operations here will be audited with user info
 *     await prisma.event.create({ data: { ... } });
 *   }
 * );
 * ```
 */
export function runWithAuditContext<T>(
  user: AuditUser | null,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return auditStorage.run({ user }, fn);
}

/**
 * Get current audit user from context
 * Returns null if no context is set (e.g., system operations)
 */
export function getAuditUser(): AuditUser | null {
  const context = auditStorage.getStore();
  return context?.user ?? null;
}

/**
 * Check if audit context is available
 */
export function hasAuditContext(): boolean {
  return auditStorage.getStore() !== undefined;
}

/**
 * System user for operations without user context
 * Used for scheduled jobs, migrations, etc.
 */
export const SYSTEM_USER: AuditUser = {
  id: "SYSTEM",
  email: "system@hva-skjer.local",
};
