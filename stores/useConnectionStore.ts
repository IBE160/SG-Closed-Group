/**
 * Zustand store for SSE connection state management
 * Tracks connection status, errors, and last event timestamps
 */

import { create } from "zustand";
import type { ConnectionStatus } from "@/lib/sse-client";

interface ConnectionError {
  message: string;
  timestamp: string;
  code?: string;
}

interface ConnectionState {
  // Connection status
  status: ConnectionStatus;
  clientId: string | null;

  // Timing information
  connectedAt: string | null;
  lastEventAt: string | null;
  lastHeartbeatAt: string | null;

  // Error tracking
  lastError: ConnectionError | null;
  reconnectAttempts: number;

  // Actions
  setStatus: (status: ConnectionStatus) => void;
  setClientId: (clientId: string | null) => void;
  setLastEventAt: (timestamp: string) => void;
  setLastHeartbeatAt: (timestamp: string) => void;
  setError: (error: ConnectionError | null) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  reset: () => void;
}

const initialState = {
  status: "disconnected" as ConnectionStatus,
  clientId: null,
  connectedAt: null,
  lastEventAt: null,
  lastHeartbeatAt: null,
  lastError: null,
  reconnectAttempts: 0,
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  ...initialState,

  setStatus: (status) =>
    set((state) => ({
      status,
      connectedAt: status === "connected" ? new Date().toISOString() : state.connectedAt,
      // Reset error on successful connection
      lastError: status === "connected" ? null : state.lastError,
    })),

  setClientId: (clientId) => set({ clientId }),

  setLastEventAt: (timestamp) => set({ lastEventAt: timestamp }),

  setLastHeartbeatAt: (timestamp) => set({ lastHeartbeatAt: timestamp }),

  setError: (error) => set({ lastError: error }),

  incrementReconnectAttempts: () =>
    set((state) => ({
      reconnectAttempts: state.reconnectAttempts + 1,
    })),

  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),

  reset: () => set(initialState),
}));

// Selector hooks for common use cases
export const useConnectionStatus = () =>
  useConnectionStore((state) => state.status);

export const useIsConnected = () =>
  useConnectionStore((state) => state.status === "connected");

export const useLastEventTimestamp = () =>
  useConnectionStore((state) => state.lastEventAt);
