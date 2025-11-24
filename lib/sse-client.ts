/**
 * Client-side SSE (Server-Sent Events) connection manager
 * Handles connection, reconnection, and fallback to polling
 */

import type { SSEEvent } from "./sse";

// Connection states
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "polling";

// Event handler type
export type SSEEventHandler = (event: SSEEvent) => void;

// SSE Client configuration
interface SSEClientConfig {
  url: string;
  onEvent: SSEEventHandler;
  onStatusChange: (status: ConnectionStatus) => void;
  onError?: (error: Error) => void;
  reconnectDelay?: number; // ms, default 3000
  maxReconnectAttempts?: number; // default 5
  pollingInterval?: number; // ms, default 5000
  enablePollingFallback?: boolean; // default true
}

/**
 * SSE Client class - manages connection lifecycle
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;
  private lastEventTimestamp: string | null = null;

  private config: Required<SSEClientConfig>;

  constructor(config: SSEClientConfig) {
    this.config = {
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      pollingInterval: 5000,
      enablePollingFallback: true,
      onError: () => {},
      ...config,
    };
  }

  /**
   * Start SSE connection
   */
  connect(): void {
    if (this.isDestroyed) return;

    this.config.onStatusChange("connecting");
    console.info("[SSE]", "Connecting to SSE stream", {
      url: this.config.url,
      timestamp: new Date().toISOString(),
    });

    try {
      this.eventSource = new EventSource(this.config.url);

      this.eventSource.onopen = () => {
        if (this.isDestroyed) return;

        this.reconnectAttempts = 0;
        this.config.onStatusChange("connected");
        this.stopPolling();

        console.info("[SSE]", "Connection established", {
          timestamp: new Date().toISOString(),
        });
      };

      this.eventSource.onmessage = (event) => {
        if (this.isDestroyed) return;

        try {
          const sseEvent: SSEEvent = JSON.parse(event.data);
          this.lastEventTimestamp = sseEvent.timestamp;
          this.config.onEvent(sseEvent);

          // Log non-heartbeat events
          if (sseEvent.type !== "heartbeat") {
            console.info("[SSE]", "Event received", {
              type: sseEvent.type,
              timestamp: sseEvent.timestamp,
            });
          }
        } catch (error) {
          console.warn("[SSE]", "Failed to parse event", {
            data: event.data,
            error: error instanceof Error ? error.message : "Unknown",
            timestamp: new Date().toISOString(),
          });
        }
      };

      this.eventSource.onerror = () => {
        if (this.isDestroyed) return;

        console.warn("[SSE]", "Connection error", {
          readyState: this.eventSource?.readyState,
          timestamp: new Date().toISOString(),
        });

        // EventSource automatically tries to reconnect, but we'll handle it ourselves
        // for better control and fallback
        this.handleDisconnect();
      };
    } catch (error) {
      console.error("[SSE]", "Failed to create EventSource", {
        error: error instanceof Error ? error.message : "Unknown",
        timestamp: new Date().toISOString(),
      });
      this.handleDisconnect();
    }
  }

  /**
   * Handle disconnection - attempt reconnect or fallback to polling
   */
  private handleDisconnect(): void {
    if (this.isDestroyed) return;

    // Close existing connection
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      // Attempt reconnection
      this.reconnectAttempts++;
      this.config.onStatusChange("reconnecting");

      const delay = this.config.reconnectDelay * Math.min(this.reconnectAttempts, 3);

      console.info("[SSE]", "Scheduling reconnection", {
        attempt: this.reconnectAttempts,
        maxAttempts: this.config.maxReconnectAttempts,
        delayMs: delay,
        timestamp: new Date().toISOString(),
      });

      this.reconnectTimeout = setTimeout(() => {
        if (!this.isDestroyed) {
          this.connect();
        }
      }, delay);
    } else if (this.config.enablePollingFallback) {
      // Fallback to polling
      console.warn("[SSE]", "Max reconnect attempts reached, falling back to polling", {
        pollingInterval: this.config.pollingInterval,
        timestamp: new Date().toISOString(),
      });
      this.startPolling();
    } else {
      // No fallback, stay disconnected
      this.config.onStatusChange("disconnected");
      this.config.onError?.(new Error("SSE connection failed and polling is disabled"));
    }
  }

  /**
   * Start polling fallback
   */
  private startPolling(): void {
    if (this.pollingInterval || this.isDestroyed) return;

    this.config.onStatusChange("polling");

    console.info("[SSE]", "Starting polling fallback", {
      interval: this.config.pollingInterval,
      timestamp: new Date().toISOString(),
    });

    // Poll for status updates
    this.pollingInterval = setInterval(async () => {
      if (this.isDestroyed) {
        this.stopPolling();
        return;
      }

      try {
        const response = await fetch("/api/sse/test");
        if (response.ok) {
          const data = await response.json();

          // Create synthetic event for polling response
          const pollEvent: SSEEvent = {
            type: "heartbeat",
            data: {
              pollingMode: true,
              clientsConnected: data.data?.clientsConnected ?? 0,
            },
            timestamp: new Date().toISOString(),
          };

          this.config.onEvent(pollEvent);
        }
      } catch (error) {
        console.warn("[SSE]", "Polling request failed", {
          error: error instanceof Error ? error.message : "Unknown",
          timestamp: new Date().toISOString(),
        });
      }
    }, this.config.pollingInterval);
  }

  /**
   * Stop polling fallback
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;

      console.info("[SSE]", "Stopped polling", {
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get last event timestamp
   */
  getLastEventTimestamp(): string | null {
    return this.lastEventTimestamp;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.isDestroyed = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.stopPolling();
    this.config.onStatusChange("disconnected");

    console.info("[SSE]", "Client disconnected", {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Force reconnection (useful after network recovery)
   */
  reconnect(): void {
    if (this.isDestroyed) return;

    console.info("[SSE]", "Manual reconnection triggered", {
      timestamp: new Date().toISOString(),
    });

    this.disconnect();
    this.isDestroyed = false;
    this.reconnectAttempts = 0;
    this.connect();
  }
}

/**
 * Create SSE client instance
 */
export function createSSEClient(config: SSEClientConfig): SSEClient {
  return new SSEClient(config);
}
