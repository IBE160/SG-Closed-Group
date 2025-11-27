/**
 * Event API - Update and Delete Events
 * Story 3.2: Event Management - Edit and Delete
 *
 * PATCH /api/events/[id] - Update an existing event
 * DELETE /api/events/[id] - Soft delete an event
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sse";
import { z } from "zod";
import { runWithAuditContext } from "@/lib/audit-context";

// Zod validation schema for event update
const updateEventSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd").max(50, "Tittel kan maks være 50 tegn").optional(),
  description: z.string().max(200, "Beskrivelse kan maks være 200 tegn").optional(),
  priority: z.enum(["CRITICAL", "NORMAL"]).optional(),
  status: z.enum(["ACTIVE", "RESOLVED", "ARCHIVED"]).optional(),
});

/**
 * PATCH /api/events/[id]
 * Update an existing event
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Du må være logget inn", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const validated = updateEventSchema.parse(body);

    // Check if event exists and is not deleted
    const existingEvent = await prisma.event.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: { message: "Hendelsen finnes ikke", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // Run with audit context for automatic audit logging
    const updatedEvent = await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        return prisma.event.update({
          where: { id },
          data: validated,
        });
      }
    );

    // Broadcast to all connected dispatchers via SSE
    broadcastSSE("event_updated", updatedEvent);

    console.info("[EVENT]", "Updated", {
      id: updatedEvent.id,
      title: updatedEvent.title,
      updatedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, error: { message: firstError.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    console.error("[EVENT]", "Update failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke oppdatere hendelse", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]
 * Soft delete an event (sets deletedAt and deletedBy)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Du må være logget inn", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if event exists and is not already deleted
    const existingEvent = await prisma.event.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: { message: "Hendelsen finnes ikke", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // Soft delete with audit context
    await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        return prisma.event.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            deletedBy: session.user.id,
          },
        });
      }
    );

    // Broadcast to all connected dispatchers via SSE
    broadcastSSE("event_deleted", { id });

    console.info("[EVENT]", "Deleted (soft)", {
      id,
      deletedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("[EVENT]", "Delete failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke slette hendelse", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
