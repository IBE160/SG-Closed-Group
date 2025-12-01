/**
 * Talegrupper API - Radio Talk Group Management
 * Story 3.8: Talegrupper (Radio Talk Groups)
 *
 * UPDATED 2025-11-30: All users can edit (not just admin)
 *
 * GET /api/talegrupper - Fetch all talegrupper
 * POST /api/talegrupper - Create new talegruppe (all logged-in users)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { broadcastSSE } from "@/lib/sse";
import { runWithAuditContext } from "@/lib/audit-context";

// Zod schema for creating talegruppe
const createTalegruppeSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd").max(50),
  details: z.string().min(1, "Detaljer er påkrevd").max(200),
});

/**
 * GET /api/talegrupper
 * Fetch all talegrupper (sorted by createdAt DESC)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Du må være logget inn", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const talegrupper = await prisma.talegruppe.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: talegrupper,
    });
  } catch (error) {
    console.error("[TALEGRUPPER]", "Fetch failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke hente talegrupper", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talegrupper
 * Create a new talegruppe (all logged-in users)
 *
 * Request body:
 * - name: Talegruppe name (e.g., "Skogbrann-01")
 * - details: Talegruppe details (e.g., "06-Brann-19")
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

    // All logged-in users can create talegrupper (not admin-only)

    const body = await request.json();
    const validated = createTalegruppeSchema.parse(body);
    const { name, details } = validated;

    // Get user display name
    const userName = session.user.name ?? session.user.email ?? "Ukjent";

    // Create talegruppe with audit context
    const talegruppe = await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        return await prisma.talegruppe.create({
          data: {
            name,
            details,
            createdBy: session.user.id,
            createdByName: userName,
            updatedBy: session.user.id,
            updatedByName: userName,
          },
        });
      }
    );

    // Broadcast SSE update
    broadcastSSE("talegruppe_created", talegruppe);

    console.info("[TALEGRUPPER]", "Talegruppe created", {
      id: talegruppe.id,
      name: talegruppe.name,
      createdBy: session.user.id,
      createdByName: userName,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: talegruppe,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, error: { message: firstError.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    console.error("[TALEGRUPPER]", "Create failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke opprette talegruppe", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
