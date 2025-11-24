/**
 * Server-side SSE (Server-Sent Events) utilities
 * Manages connected clients and broadcasts events to all dispatchers
 */

// SSE Event Types
export type SSEEventType =
  | "connection"
  | "heartbeat"
  | "flash_message"
  | "event_created"
  | "event_updated"
  | "event_deleted"
  | "bilstatus_update"
  | "bonfire_created"
  | "bonfire_status_update"
  | "test_broadcast";

// SSE Event interface (standardized format per architecture.md)
export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
  timestamp: string; // ISO 8601 UTC timestamp
}

// Connected client tracking
interface ConnectedClient {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  connectedAt: Date;
}

// Global client storage (in-memory for serverless)
// Note: In production with multiple instances, use Redis pub/sub
const clients = new Map<string, ConnectedClient>();

/**
 * Generate unique client ID
 */
export function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add a new SSE client connection
 */
export function addClient(
  id: string,
  controller: ReadableStreamDefaultController<Uint8Array>
): void {
  clients.set(id, {
    id,
    controller,
    connectedAt: new Date(),
  });
  console.info("[SSE]", "Client connected", {
    clientId: id,
    totalClients: clients.size,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Remove a disconnected SSE client
 */
export function removeClient(id: string): void {
  const client = clients.get(id);
  if (client) {
    clients.delete(id);
    console.info("[SSE]", "Client disconnected", {
      clientId: id,
      totalClients: clients.size,
      connectedDuration: Date.now() - client.connectedAt.getTime(),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Get current client count
 */
export function getClientCount(): number {
  return clients.size;
}

/**
 * Format SSE message according to spec
 * Each message must end with double newline
 */
function formatSSEMessage(event: SSEEvent): string {
  const data = JSON.stringify(event);
  return `data: ${data}\n\n`;
}

/**
 * Send event to a specific client
 */
function sendToClient(
  client: ConnectedClient,
  event: SSEEvent
): boolean {
  try {
    const message = formatSSEMessage(event);
    const encoder = new TextEncoder();
    client.controller.enqueue(encoder.encode(message));
    return true;
  } catch (error) {
    console.warn("[SSE]", "Failed to send to client", {
      clientId: client.id,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    // Client likely disconnected, remove them
    removeClient(client.id);
    return false;
  }
}

/**
 * Broadcast event to ALL connected clients
 * Returns number of clients successfully notified
 */
export function broadcastSSE(
  type: SSEEventType,
  data: unknown
): number {
  const event: SSEEvent = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  let successCount = 0;
  const clientsToRemove: string[] = [];

  clients.forEach((client) => {
    const success = sendToClient(client, event);
    if (success) {
      successCount++;
    } else {
      clientsToRemove.push(client.id);
    }
  });

  // Clean up failed clients
  clientsToRemove.forEach((id) => removeClient(id));

  if (clients.size > 0) {
    console.info("[SSE]", "Broadcast completed", {
      type,
      successCount,
      totalClients: clients.size,
      timestamp: new Date().toISOString(),
    });
  }

  return successCount;
}

/**
 * Send heartbeat to keep connections alive
 * Call this periodically (e.g., every 30 seconds)
 */
export function sendHeartbeat(): void {
  broadcastSSE("heartbeat", { status: "alive" });
}

/**
 * Get all connected client IDs (for debugging)
 */
export function getConnectedClients(): string[] {
  return Array.from(clients.keys());
}
