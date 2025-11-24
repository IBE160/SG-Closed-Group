"use client";

/**
 * SSE Provider Component
 * Initializes and manages SSE connection for the entire application
 * Wrap your app with this provider to enable real-time updates
 */

import { useEffect, useRef, useCallback } from "react";
import { SSEClient, createSSEClient } from "@/lib/sse-client";
import { useConnectionStore } from "@/stores/useConnectionStore";
import type { SSEEvent } from "@/lib/sse";

interface SSEProviderProps {
  children: React.ReactNode;
}

export function SSEProvider({ children }: SSEProviderProps) {
  const clientRef = useRef<SSEClient | null>(null);

  const {
    setStatus,
    setClientId,
    setLastEventAt,
    setLastHeartbeatAt,
    setError,
  } = useConnectionStore();

  /**
   * Handle incoming SSE events
   */
  const handleEvent = useCallback(
    (event: SSEEvent) => {
      // Update last event timestamp
      setLastEventAt(event.timestamp);

      switch (event.type) {
        case "connection":
          // Extract client ID from connection event
          if (
            event.data &&
            typeof event.data === "object" &&
            "clientId" in event.data
          ) {
            setClientId((event.data as { clientId: string }).clientId);
          }
          console.info("[SSE]", "Connected with client ID", {
            data: event.data,
            timestamp: event.timestamp,
          });
          break;

        case "heartbeat":
          setLastHeartbeatAt(event.timestamp);
          // Heartbeats are quiet - don't log unless debugging
          break;

        case "test_broadcast":
          console.info("[SSE]", "Test broadcast received", {
            data: event.data,
            timestamp: event.timestamp,
          });
          break;

        case "flash_message":
          // Will be handled by flash message store in Epic 4
          console.info("[SSE]", "Flash message received", {
            data: event.data,
            timestamp: event.timestamp,
          });
          break;

        case "bilstatus_update":
          // Will be handled by bilstatus store in Epic 3
          console.info("[SSE]", "Bilstatus update received", {
            data: event.data,
            timestamp: event.timestamp,
          });
          break;

        case "event_created":
        case "event_updated":
        case "event_deleted":
          // Will be handled by event store in Epic 3
          console.info("[SSE]", `Event ${event.type} received`, {
            data: event.data,
            timestamp: event.timestamp,
          });
          break;

        case "bonfire_created":
        case "bonfire_status_update":
          // Will be handled by bonfire store in Epic 5
          console.info("[SSE]", `Bonfire ${event.type} received`, {
            data: event.data,
            timestamp: event.timestamp,
          });
          break;

        default:
          console.warn("[SSE]", "Unknown event type received", {
            type: event.type,
            data: event.data,
            timestamp: event.timestamp,
          });
      }
    },
    [setLastEventAt, setLastHeartbeatAt, setClientId]
  );

  /**
   * Handle status changes
   */
  const handleStatusChange = useCallback(
    (status: Parameters<typeof setStatus>[0]) => {
      setStatus(status);

      // Log status changes with appropriate level
      switch (status) {
        case "connected":
          console.info("[SSE]", "Status: Connected", {
            timestamp: new Date().toISOString(),
          });
          break;
        case "connecting":
          console.info("[SSE]", "Status: Connecting...", {
            timestamp: new Date().toISOString(),
          });
          break;
        case "reconnecting":
          console.warn("[SSE]", "Status: Reconnecting...", {
            timestamp: new Date().toISOString(),
          });
          break;
        case "polling":
          console.warn("[SSE]", "Status: Fallen back to polling", {
            timestamp: new Date().toISOString(),
          });
          break;
        case "disconnected":
          console.warn("[SSE]", "Status: Disconnected", {
            timestamp: new Date().toISOString(),
          });
          break;
      }
    },
    [setStatus]
  );

  /**
   * Handle errors
   */
  const handleError = useCallback(
    (error: Error) => {
      setError({
        message: error.message,
        timestamp: new Date().toISOString(),
      });

      console.error("[SSE]", "Connection error", {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    },
    [setError]
  );

  /**
   * Initialize SSE connection on mount
   */
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Create SSE client
    const client = createSSEClient({
      url: "/api/sse",
      onEvent: handleEvent,
      onStatusChange: handleStatusChange,
      onError: handleError,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      pollingInterval: 5000,
      enablePollingFallback: true,
    });

    clientRef.current = client;

    // Connect to SSE
    client.connect();

    console.info("[SSE]", "SSE Provider initialized", {
      timestamp: new Date().toISOString(),
    });

    // Cleanup on unmount
    return () => {
      console.info("[SSE]", "SSE Provider unmounting", {
        timestamp: new Date().toISOString(),
      });
      client.disconnect();
      clientRef.current = null;
    };
  }, [handleEvent, handleStatusChange, handleError]);

  // Just render children - SSE runs in background
  return <>{children}</>;
}

export default SSEProvider;
