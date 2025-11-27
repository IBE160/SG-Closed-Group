/**
 * Vaktplan API - Duty Roster Display and Management
 * Story 3.6: Vaktplan - Duty Roster Display (fixed fields)
 * Story 3.7: Vaktplan - Administrator Editing
 *
 * UPDATED 2025-11-27: Changed from generic positions to fixed fields
 * - Vakt09: name only
 * - Lederstøtte: name + phone
 *
 * GET /api/vaktplan - Fetch duty roster for a specific week
 * POST /api/vaktplan - Create/update roster entry (admin only, upsert)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getISOWeek, getYear } from "date-fns";
import { z } from "zod";
import { broadcastSSE } from "@/lib/sse";
import { runWithAuditContext } from "@/lib/audit-context";

// Zod schema for creating/updating roster entry (upsert)
const upsertRosterSchema = z.object({
  week: z.number().int().min(1).max(53),
  year: z.number().int().min(2000).max(2100),
  vakt09Name: z.string().max(100).optional().nullable(),
  lederstotteName: z.string().max(100).optional().nullable(),
  lederstottePhone: z.string().max(20).optional().nullable(),
});

/**
 * GET /api/vaktplan
 * Fetch duty roster for a specific week/year
 *
 * Query params:
 * - week: ISO week number (1-53), defaults to current week
 * - year: Year, defaults to current year
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Du må være logget inn", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const currentWeek = getISOWeek(now);
    const currentYear = getYear(now);

    const week = parseInt(searchParams.get("week") ?? String(currentWeek), 10);
    const year = parseInt(searchParams.get("year") ?? String(currentYear), 10);

    // Validate week and year
    if (isNaN(week) || week < 1 || week > 53) {
      return NextResponse.json(
        { success: false, error: { message: "Ugyldig ukenummer (1-53)", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { success: false, error: { message: "Ugyldig år", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    // Fetch duty roster for the specified week/year (single entry per week)
    const roster = await prisma.dutyRoster.findUnique({
      where: {
        weekNumber_year: {
          weekNumber: week,
          year: year,
        },
      },
    });

    // Return data (roster may be null if no entry exists)
    return NextResponse.json({
      success: true,
      data: {
        id: roster?.id ?? null,
        week,
        year,
        vakt09Name: roster?.vakt09Name ?? null,
        lederstotteName: roster?.lederstotteName ?? null,
        lederstottePhone: roster?.lederstottePhone ?? null,
      },
    });
  } catch (error) {
    console.error("[VAKTPLAN]", "Fetch failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke hente vaktplan", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vaktplan
 * Create or update roster entry for a week (admin only, upsert)
 *
 * Request body:
 * - week: ISO week number (1-53)
 * - year: Year
 * - vakt09Name?: Vakt09 person name
 * - lederstotteName?: Lederstøtte person name
 * - lederstottePhone?: Lederstøtte phone number
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Du må være logget inn", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    // Check administrator role
    if (session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        { success: false, error: { message: "Kun administratorer kan redigere vaktplan", code: "FORBIDDEN" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = upsertRosterSchema.parse(body);
    const { week, year, vakt09Name, lederstotteName, lederstottePhone } = validated;

    // Upsert roster entry with audit context
    const rosterEntry = await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        return await prisma.dutyRoster.upsert({
          where: {
            weekNumber_year: {
              weekNumber: week,
              year,
            },
          },
          update: {
            vakt09Name: vakt09Name ?? null,
            lederstotteName: lederstotteName ?? null,
            lederstottePhone: lederstottePhone ?? null,
          },
          create: {
            weekNumber: week,
            year,
            vakt09Name: vakt09Name ?? null,
            lederstotteName: lederstotteName ?? null,
            lederstottePhone: lederstottePhone ?? null,
          },
        });
      }
    );

    // Broadcast SSE update
    broadcastSSE("vaktplan_update", {
      week,
      year,
      vakt09Name: rosterEntry.vakt09Name,
      lederstotteName: rosterEntry.lederstotteName,
      lederstottePhone: rosterEntry.lederstottePhone,
    });

    console.info("[VAKTPLAN]", "Entry upserted", {
      id: rosterEntry.id,
      week,
      year,
      vakt09Name: rosterEntry.vakt09Name,
      lederstotteName: rosterEntry.lederstotteName,
      updatedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: rosterEntry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, error: { message: firstError.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    console.error("[VAKTPLAN]", "Upsert failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke oppdatere vaktplan", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
