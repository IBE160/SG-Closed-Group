/**
 * SSE Test Endpoint
 * Triggers a test broadcast to all connected clients
 * Used to verify SSE infrastructure is working correctly
 */

import { broadcastSSE, getClientCount, getConnectedClients } from "@/lib/sse";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  const startTime = Date.now();

  // Get optional message from request body
  let message = "Test broadcast from SSE infrastructure";
  try {
    const body = await request.json();
    if (body.message) {
      message = body.message;
    }
  } catch {
    // No body or invalid JSON, use default message
  }

  const clientCount = getClientCount();
  const connectedClients = getConnectedClients();

  // Broadcast test event to all connected clients
  const successCount = broadcastSSE("test_broadcast", {
    message,
    testId: `test_${Date.now()}`,
    clientCountAtBroadcast: clientCount,
  });

  const duration = Date.now() - startTime;

  console.info("[SSE]", "Test broadcast triggered", {
    message,
    clientCount,
    successCount,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });

  return Response.json({
    success: true,
    data: {
      message: "Test broadcast sent",
      clientsConnected: clientCount,
      clientsNotified: successCount,
      connectedClientIds: connectedClients,
      broadcastDuration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function GET(): Promise<Response> {
  // GET endpoint returns current SSE status
  const clientCount = getClientCount();
  const connectedClients = getConnectedClients();

  return Response.json({
    success: true,
    data: {
      status: "SSE infrastructure active",
      clientsConnected: clientCount,
      connectedClientIds: connectedClients,
      timestamp: new Date().toISOString(),
    },
  });
}
