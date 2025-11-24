/**
 * Audit Log Query API
 * Provides read-only access to audit logs for administrators
 * No DELETE or UPDATE endpoints - append-only for compliance
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuditedTables } from "@/lib/audit";

// Disable caching for audit data
export const dynamic = "force-dynamic";

/**
 * GET /api/audit
 * Query audit logs with filtering and pagination
 *
 * Query Parameters:
 * - limit: number (default 50, max 100)
 * - offset: number (default 0)
 * - tableName: string (filter by table)
 * - userId: string (filter by user)
 * - actionType: CREATE | UPDATE | DELETE (filter by action)
 * - startDate: ISO date string (filter from date)
 * - endDate: ISO date string (filter to date)
 */
export async function GET(request: NextRequest): Promise<Response> {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse pagination
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10)),
      100
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    // Parse filters
    const tableName = searchParams.get("tableName");
    const userId = searchParams.get("userId");
    const actionType = searchParams.get("actionType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: {
      tableName?: string;
      userId?: string;
      actionType?: string;
      timestamp?: { gte?: Date; lte?: Date };
    } = {};

    if (tableName) {
      where.tableName = tableName;
    }

    if (userId) {
      where.userId = userId;
    }

    if (actionType) {
      const validActions = ["CREATE", "UPDATE", "DELETE"];
      if (validActions.includes(actionType.toUpperCase())) {
        where.actionType = actionType.toUpperCase();
      }
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          where.timestamp.gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          where.timestamp.lte = end;
        }
      }
    }

    // Execute query with count
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const duration = Date.now() - startTime;

    console.info("[AUDIT]", "Query executed", {
      filters: { tableName, userId, actionType, startDate, endDate },
      results: logs.length,
      total,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      data: {
        logs,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + logs.length < total,
        },
        meta: {
          auditedTables: getAuditedTables(),
          queryDuration: `${duration}ms`,
        },
      },
    });
  } catch (error) {
    console.error("[AUDIT]", "Query failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    return Response.json(
      {
        success: false,
        error: "Failed to query audit logs",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit - Not allowed (append-only)
 */
export async function POST(): Promise<Response> {
  return Response.json(
    {
      success: false,
      error: "Audit logs are automatically created by the system. Manual creation is not allowed.",
    },
    { status: 405 }
  );
}

/**
 * PUT /api/audit - Not allowed (append-only)
 */
export async function PUT(): Promise<Response> {
  return Response.json(
    {
      success: false,
      error: "Audit logs cannot be modified. They are immutable for compliance.",
    },
    { status: 405 }
  );
}

/**
 * DELETE /api/audit - Not allowed (append-only)
 */
export async function DELETE(): Promise<Response> {
  return Response.json(
    {
      success: false,
      error: "Audit logs cannot be deleted. Retention is managed by system policy.",
    },
    { status: 405 }
  );
}
