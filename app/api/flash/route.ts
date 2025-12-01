/**
 * Flash Message API - Urgent Dispatcher Communication
 * Story 4.1: Flash Message Basic Send and Receive
 *
 * GET /api/flash - Fetch recent flash messages
 * POST /api/flash - Send a new flash message to all dispatchers
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sse";
import { runWithAuditContext } from "@/lib/audit-context";
import { flashMessageSchema } from "@/lib/validations/flash";
import { z } from "zod";

/**
 * GET /api/flash
 * Fetch recent flash messages (sorted by createdAt DESC)
 *
 * Query params:
 * - limit: Number of messages to return (default: 10, max: 100)
 * - cursor: Message ID for pagination (optional)
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Du må være logget inn", code: "UNAUTHORIZED" },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    // Parse and validate limit
    const limit = Math.min(Math.max(parseInt(limitParam || "10", 10) || 10, 1), 100);

    // Build query with cursor-based pagination
    const messages = await prisma.flashMessage.findMany({
      take: limit + 1, // Fetch one extra to determine if there's more
      orderBy: { createdAt: "desc" },
      where: {
        // Only show non-expired messages
        expiresAt: { gt: new Date() },
        ...(cursor && {
          createdAt: {
            lt: (await prisma.flashMessage.findUnique({ where: { id: cursor } }))?.createdAt,
          },
        }),
      },
      select: {
        id: true,
        content: true,
        senderName: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Determine if there are more messages
    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return NextResponse.json({
      success: true,
      data,
      nextCursor,
    });
  } catch (error) {
    console.error("[FLASH]", "Fetch failed", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Kunne ikke hente meldinger", code: "INTERNAL_ERROR" },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/flash
 * Send a new flash message to all connected dispatchers
 *
 * Request body:
 * - content: Message text (1-100 chars)
 *
 * Response:
 * - success: boolean
 * - data: FlashMessage object
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Du må være logget inn", code: "UNAUTHORIZED" },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = flashMessageSchema.parse(body);
    const { content } = validated;

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Get sender name from session
    const senderName = session.user.name || session.user.email?.split("@")[0] || "Ukjent";

    // Create flash message with audit context
    const message = await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        return await prisma.flashMessage.create({
          data: {
            content,
            createdBy: session.user.id,
            senderName,
            expiresAt,
          },
        });
      }
    );

    // Broadcast to all connected dispatchers via SSE
    broadcastSSE("flash_message", {
      id: message.id,
      content: message.content,
      senderName: message.senderName,
      createdAt: message.createdAt.toISOString(),
    });

    console.info("[FLASH]", "Message sent", {
      id: message.id,
      contentLength: content.length,
      createdBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        senderName: message.senderName,
        createdAt: message.createdAt.toISOString(),
        expiresAt: message.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: { message: firstError.message, code: "VALIDATION_ERROR" },
        },
        { status: 400 }
      );
    }
    console.error("[FLASH]", "Send failed", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Kunne ikke sende melding", code: "INTERNAL_ERROR" },
      },
      { status: 500 }
    );
  }
}
