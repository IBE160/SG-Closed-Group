/**
 * Event API - Create and List Events
 * Story 3.1: Event Management
 *
 * GET /api/events - Fetch all active events, sorted by priority then createdAt DESC
 * POST /api/events - Create a new event
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sse";
import { z } from "zod";
import { runWithAuditContext } from "@/lib/audit-context";

// Zod validation schema for event creation
const createEventSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd").max(50, "Tittel kan maks være 50 tegn"),
  description: z.string().max(200, "Beskrivelse kan maks være 200 tegn").default(""),
  priority: z.enum(["CRITICAL", "NORMAL"]).default("NORMAL"),
});

/**
 * GET /api/events
 * Fetch all active events, sorted by priority (CRITICAL first) then createdAt DESC
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

    const events = await prisma.event.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
      orderBy: [
        { priority: "asc" }, // CRITICAL comes before NORMAL alphabetically
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("[EVENT]", "Fetch failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke hente hendelser", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new event
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

    const body = await request.json();
    const validated = createEventSchema.parse(body);

    // Run with audit context for automatic audit logging
    const event = await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        return prisma.event.create({
          data: {
            title: validated.title,
            description: validated.description,
            priority: validated.priority,
            createdBy: session.user.id,
          },
        });
      }
    );

    // Broadcast to all connected dispatchers via SSE
    broadcastSSE("event_created", event);

    console.info("[EVENT]", "Created", {
      id: event.id,
      title: event.title,
      priority: event.priority,
      createdBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, error: { message: firstError.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    console.error("[EVENT]", "Create failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke opprette hendelse", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
