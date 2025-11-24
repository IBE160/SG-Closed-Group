/**
 * Prisma Audit Extension for Prisma 6.x
 * Automatically logs CREATE, UPDATE, DELETE operations to AuditLog table
 * Uses Prisma Client Extensions (replaces deprecated $use middleware)
 * Follows architecture.md patterns for audit logging
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { getAuditUser, SYSTEM_USER } from "./audit-context";

// Tables to audit - all tables that store user-modifiable data
const AUDITED_TABLES = new Set([
  "Event",
  "FlashMessage",
  "Bonfire",
  "VehicleStatus",
  "DutyRoster",
  "User",
  "Session",
]);

// Tables to exclude from audit (prevent recursion)
const EXCLUDED_TABLES = new Set(["AuditLog"]);

/**
 * Map Prisma operation to audit action type
 */
function mapActionType(
  operation: string
): "CREATE" | "UPDATE" | "DELETE" | null {
  if (operation.startsWith("create")) return "CREATE";
  if (operation.startsWith("update") || operation === "upsert") return "UPDATE";
  if (operation.startsWith("delete")) return "DELETE";
  return null;
}

/**
 * Sanitize data for JSON storage
 * Removes sensitive fields and converts to plain object
 */
function sanitizeForAudit(data: unknown): Prisma.InputJsonValue | null {
  if (data === null || data === undefined) {
    return null;
  }

  if (typeof data !== "object") {
    return data as Prisma.InputJsonValue;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeForAudit) as Prisma.InputJsonValue;
  }

  // Convert to plain object and remove sensitive fields
  const sanitized: Record<string, Prisma.InputJsonValue | null> = {};
  const sensitiveFields = new Set([
    "password",
    "passwordHash",
    "accessToken",
    "refreshToken",
    "sessionToken",
  ]);

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (sensitiveFields.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (value instanceof Date) {
      sanitized[key] = value.toISOString();
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeForAudit(value);
    } else {
      sanitized[key] = value as Prisma.InputJsonValue;
    }
  }

  return sanitized as Prisma.InputJsonValue;
}

/**
 * Create audit log entry
 * Uses a separate Prisma client instance to avoid extension recursion
 */
async function createAuditEntry(
  auditPrisma: PrismaClient,
  tableName: string,
  recordId: string,
  actionType: "CREATE" | "UPDATE" | "DELETE",
  oldValues: unknown,
  newValues: unknown
): Promise<void> {
  const user = getAuditUser() ?? SYSTEM_USER;

  try {
    await auditPrisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        tableName,
        recordId,
        actionType,
        oldValues: sanitizeForAudit(oldValues) ?? Prisma.JsonNull,
        newValues: sanitizeForAudit(newValues) ?? Prisma.JsonNull,
        // timestamp uses default(now()) in schema
      },
    });

    console.info("[AUDIT]", "Entry created", {
      tableName,
      recordId,
      actionType,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log error but don't fail the original operation
    console.error("[AUDIT]", "Failed to create audit entry", {
      tableName,
      recordId,
      actionType,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Check if an operation should be audited
 */
function shouldAudit(model: string, operation: string): boolean {
  if (EXCLUDED_TABLES.has(model)) return false;
  if (!AUDITED_TABLES.has(model)) return false;

  const actionType = mapActionType(operation);
  return actionType !== null;
}

/**
 * Extract record ID from result
 */
function extractRecordId(result: unknown): string {
  if (result && typeof result === "object" && "id" in result) {
    return String((result as { id: unknown }).id);
  }
  return "unknown";
}

/**
 * Create Prisma Client with audit extension
 * Prisma 6.x uses extensions instead of middleware
 *
 * @param auditPrisma - Separate Prisma client for audit operations (to avoid recursion)
 */
export function createAuditedPrismaClient(
  basePrisma: PrismaClient,
  auditPrisma: PrismaClient
) {
  return basePrisma.$extends({
    name: "audit-logging",
    query: {
      $allModels: {
        async create({ model, args, query }) {
          const result = await query(args);

          if (shouldAudit(model, "create")) {
            const recordId = extractRecordId(result);
            // Fire and forget - don't block response
            createAuditEntry(
              auditPrisma,
              model,
              recordId,
              "CREATE",
              null,
              result
            ).catch(() => {});
          }

          return result;
        },

        async createMany({ model, args, query }) {
          const result = await query(args);

          if (shouldAudit(model, "createMany")) {
            createAuditEntry(
              auditPrisma,
              model,
              "multiple",
              "CREATE",
              null,
              args.data
            ).catch(() => {});
          }

          return result;
        },

        async update({ model, args, query }) {
          // Get existing record before update
          let oldValues: unknown = null;
          if (shouldAudit(model, "update") && args.where) {
            try {
              const modelDelegate = auditPrisma[
                model.charAt(0).toLowerCase() + model.slice(1) as keyof typeof auditPrisma
              ] as { findFirst?: (args: { where: unknown }) => Promise<unknown> } | undefined;

              if (modelDelegate?.findFirst) {
                oldValues = await modelDelegate.findFirst({ where: args.where });
              }
            } catch {
              // Continue without old values
            }
          }

          const result = await query(args);

          if (shouldAudit(model, "update")) {
            const recordId = extractRecordId(result);
            createAuditEntry(
              auditPrisma,
              model,
              recordId,
              "UPDATE",
              oldValues,
              result
            ).catch(() => {});
          }

          return result;
        },

        async updateMany({ model, args, query }) {
          const result = await query(args);

          if (shouldAudit(model, "updateMany")) {
            createAuditEntry(
              auditPrisma,
              model,
              "multiple",
              "UPDATE",
              null,
              args.data
            ).catch(() => {});
          }

          return result;
        },

        async upsert({ model, args, query }) {
          const result = await query(args);

          if (shouldAudit(model, "upsert")) {
            const recordId = extractRecordId(result);
            createAuditEntry(
              auditPrisma,
              model,
              recordId,
              "UPDATE",
              null,
              result
            ).catch(() => {});
          }

          return result;
        },

        async delete({ model, args, query }) {
          // Get existing record before delete
          let oldValues: unknown = null;
          if (shouldAudit(model, "delete") && args.where) {
            try {
              const modelDelegate = auditPrisma[
                model.charAt(0).toLowerCase() + model.slice(1) as keyof typeof auditPrisma
              ] as { findFirst?: (args: { where: unknown }) => Promise<unknown> } | undefined;

              if (modelDelegate?.findFirst) {
                oldValues = await modelDelegate.findFirst({ where: args.where });
              }
            } catch {
              // Continue without old values
            }
          }

          const result = await query(args);

          if (shouldAudit(model, "delete")) {
            const recordId = extractRecordId(result) ?? extractRecordId(oldValues);
            createAuditEntry(
              auditPrisma,
              model,
              recordId,
              "DELETE",
              oldValues,
              null
            ).catch(() => {});
          }

          return result;
        },

        async deleteMany({ model, args, query }) {
          const result = await query(args);

          if (shouldAudit(model, "deleteMany")) {
            createAuditEntry(
              auditPrisma,
              model,
              "multiple",
              "DELETE",
              null,
              null
            ).catch(() => {});
          }

          return result;
        },
      },
    },
  });
}

/**
 * Check if a table should be audited
 */
export function isAuditedTable(tableName: string): boolean {
  return AUDITED_TABLES.has(tableName) && !EXCLUDED_TABLES.has(tableName);
}

/**
 * Get list of audited tables
 */
export function getAuditedTables(): string[] {
  return Array.from(AUDITED_TABLES);
}
