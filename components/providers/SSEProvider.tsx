"use client";

/**
 * SSE Provider Component
 * Centralized SSE connection manager for the entire application.
 *
 * IMPORTANT: This is the ONLY component that should create an EventSource connection.
 * All other components should use Zustand stores to access real-time data.
 *
 * This prevents multiple SSE connections and eliminates blinking/race conditions.
 */

import { useEffect, useRef, useCallback } from "react";
import { SSEClient, createSSEClient } from "@/lib/sse-client";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { useEventsStore, type Event } from "@/stores/useEventsStore";
import { useBilstatusStore, type BilstatusData } from "@/stores/useBilstatusStore";
import { useTalegrupperStore, type Talegruppe } from "@/stores/useTalegrupperStore";
import { useVaktplanStore } from "@/stores/useVaktplanStore";
import { useFlashStore } from "@/stores/useFlashStore";
import type { SSEEvent } from "@/lib/sse";

interface SSEProviderProps {
  children: React.ReactNode;
}

export function SSEProvider({ children }: SSEProviderProps) {
  const clientRef = useRef<SSEClient | null>(null);

  // Connection store actions
  const {
    setStatus,
    setClientId,
    setLastEventAt,
    setLastHeartbeatAt,
    setError,
  } = useConnectionStore();

  // Get store actions (not state, to avoid re-renders)
  const eventsStore = useEventsStore;
  const bilstatusStore = useBilstatusStore;
  const talegrupperStore = useTalegrupperStore;
  const vaktplanStore = useVaktplanStore;
  const flashStore = useFlashStore;

  /**
   * Handle incoming SSE events and dispatch to appropriate stores
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
          break;

        case "heartbeat":
          setLastHeartbeatAt(event.timestamp);
          break;

        // Event updates - dispatch to events store
        case "event_created":
          eventsStore.getState().addEvent(event.data as Event);
          break;

        case "event_updated":
          eventsStore.getState().updateEvent(event.data as Event);
          break;

        case "event_deleted":
          if (event.data && typeof event.data === "object" && "id" in event.data) {
            eventsStore.getState().removeEvent((event.data as { id: string }).id);
          }
          break;

        // Bilstatus updates - dispatch to bilstatus store
        case "bilstatus_update":
          bilstatusStore.getState().setBilstatus(event.data as BilstatusData);
          break;

        // Talegrupper updates - dispatch to talegrupper store
        case "talegruppe_created":
          talegrupperStore.getState().addTalegruppe(event.data as Talegruppe);
          break;

        case "talegruppe_updated":
          talegrupperStore.getState().updateTalegruppe(event.data as Talegruppe);
          break;

        case "talegruppe_deleted":
          if (event.data && typeof event.data === "object" && "id" in event.data) {
            talegrupperStore.getState().removeTalegruppe((event.data as { id: string }).id);
          }
          break;

        // Vaktplan updates - dispatch to vaktplan store
        case "vaktplan_update":
          if (event.data && typeof event.data === "object") {
            const data = event.data as {
              week: number;
              year: number;
              vakt09Name?: string | null;
              lederstotteName?: string | null;
              lederstottePhone?: string | null;
              updatedByName?: string | null;
              updatedAt?: string | null;
            };
            vaktplanStore.getState().updateVaktplanFromSSE(data);
          }
          break;

        // Bonfire events - log for now (handled separately in bonfire pages)
        case "bonfire_created":
        case "bonfire_status_update":
          // These are handled by bonfire-specific components
          break;

        case "flash_message":
          // Add message to flash store
          if (event.data && typeof event.data === "object") {
            const flashData = event.data as { id: string; content: string; senderName?: string | null; createdAt: string };
            flashStore.getState().addMessage({
              id: flashData.id,
              content: flashData.content,
              senderName: flashData.senderName,
              createdAt: flashData.createdAt,
            });
          }
          console.info("[SSE]", "Flash message received", {
            data: event.data,
            timestamp: event.timestamp,
          });
          break;

        case "test_broadcast":
          console.info("[SSE] Test broadcast received:", event.data);
          break;

        default:
          console.warn("[SSE] Unknown event type:", event.type);
      }
    },
    [setLastEventAt, setLastHeartbeatAt, setClientId, eventsStore, bilstatusStore, talegrupperStore, vaktplanStore, flashStore]
  );

  /**
   * Handle status changes
   */
  const handleStatusChange = useCallback(
    (status: Parameters<typeof setStatus>[0]) => {
      setStatus(status);
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
      console.error("[SSE] Connection error:", error.message);
    },
    [setError]
  );

  /**
   * Initialize SSE connection on mount - SINGLE connection for entire app
   */
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Create SSE client with optimized settings
    const client = createSSEClient({
      url: "/api/sse",
      onEvent: handleEvent,
      onStatusChange: handleStatusChange,
      onError: handleError,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      pollingInterval: 10000, // Fallback polling only when SSE fails
      enablePollingFallback: true,
    });

    clientRef.current = client;

    // Connect to SSE
    client.connect();

    // Cleanup on unmount
    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [handleEvent, handleStatusChange, handleError]);

  // Just render children - SSE runs in background
  return <>{children}</>;
}

export default SSEProvider;
