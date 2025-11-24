/**
 * SSE (Server-Sent Events) API Endpoint
 * Establishes persistent connection for real-time updates to dispatchers
 *
 * Uses edge runtime for longer connection support (Vercel serverless has 10s timeout)
 */

import {
  addClient,
  removeClient,
  generateClientId,
} from "@/lib/sse";

// Use edge runtime for better SSE support (longer timeout, lower latency)
export const runtime = "edge";

// Disable caching for SSE
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const clientId = generateClientId();
  const encoder = new TextEncoder();

  // Track if connection is closed
  let isClosed = false;

  // Create a ReadableStream that we control
  const readable = new ReadableStream({
    start(controller) {
      // Register client with the SSE manager
      addClient(clientId, controller);

      // Send initial connection confirmation
      const welcomeEvent = {
        type: "connection",
        data: {
          clientId,
          message: "Connected to SSE stream",
          serverTime: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      try {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(welcomeEvent)}\n\n`)
        );
      } catch {
        // Controller might be closed
      }

      console.info("[SSE]", "Stream started", {
        clientId,
        timestamp: new Date().toISOString(),
      });
    },

    cancel() {
      // Client disconnected
      isClosed = true;
      removeClient(clientId);
      console.info("[SSE]", "Stream cancelled by client", {
        clientId,
        timestamp: new Date().toISOString(),
      });
    },
  });

  // Set up heartbeat interval to keep connection alive
  // Edge runtime supports longer intervals
  const heartbeatInterval = setInterval(() => {
    if (isClosed) {
      clearInterval(heartbeatInterval);
      return;
    }

    try {
      // Send heartbeat through broadcast (will only send to this client if others disconnected)
      // Individual heartbeat not needed as broadcast handles it
    } catch {
      clearInterval(heartbeatInterval);
      isClosed = true;
      removeClient(clientId);
    }
  }, 30000); // 30 second heartbeat

  // Return the SSE response with proper headers
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering if behind proxy
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
