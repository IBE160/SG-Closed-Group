/**
 * Talegrupper API - Individual Entry Management
 * Story 3.8: Talegrupper (Radio Talk Groups)
 *
 * PATCH /api/talegrupper/[id] - Update talegruppe (admin only)
 * DELETE /api/talegrupper/[id] - Delete talegruppe (admin only)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { broadcastSSE } from "@/lib/sse";
import { runWithAuditContext } from "@/lib/audit-context";

// Zod schema for updating talegruppe
const updateTalegruppeSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  details: z.string().min(1).max(200).optional(),
});

/**
 * PATCH /api/talegrupper/[id]
 * Update an existing talegruppe (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: { message: "Kun administratorer kan redigere talegrupper", code: "FORBIDDEN" } },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if talegruppe exists
    const existingTalegruppe = await prisma.talegruppe.findUnique({
      where: { id },
    });

    if (!existingTalegruppe) {
      return NextResponse.json(
        { success: false, error: { message: "Talegruppe ikke funnet", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateTalegruppeSchema.parse(body);

    // Update talegruppe with audit context
    const updatedTalegruppe = await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        return await prisma.talegruppe.update({
          where: { id },
          data: validated,
        });
      }
    );

    // Broadcast SSE update
    broadcastSSE("talegruppe_updated", updatedTalegruppe);

    console.info("[TALEGRUPPER]", "Talegruppe updated", {
      id,
      name: updatedTalegruppe.name,
      updatedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedTalegruppe,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, error: { message: firstError.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    console.error("[TALEGRUPPER]", "Update failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke oppdatere talegruppe", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/talegrupper/[id]
 * Delete an existing talegruppe (admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: { message: "Kun administratorer kan slette talegrupper", code: "FORBIDDEN" } },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if talegruppe exists
    const existingTalegruppe = await prisma.talegruppe.findUnique({
      where: { id },
    });

    if (!existingTalegruppe) {
      return NextResponse.json(
        { success: false, error: { message: "Talegruppe ikke funnet", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // Delete talegruppe with audit context
    await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        await prisma.talegruppe.delete({
          where: { id },
        });
      }
    );

    // Broadcast SSE update
    broadcastSSE("talegruppe_deleted", { id });

    console.info("[TALEGRUPPER]", "Talegruppe deleted", {
      id,
      name: existingTalegruppe.name,
      deletedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("[TALEGRUPPER]", "Delete failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke slette talegruppe", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
