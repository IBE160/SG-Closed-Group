/**
 * Zustand store for bilstatus (vehicle status) state management
 * Centralized store for real-time vehicle status updates via SSE
 */

import { create } from "zustand";

export type VehicleStatus = "READY" | "OUT" | "OUT_OF_SERVICE";

export interface VehicleData {
  status: VehicleStatus;
  note: string | null;
  updatedAt: string;
}

export interface BilstatusData {
  S111: VehicleData;
  S112: VehicleData;
}

interface BilstatusState {
  bilstatus: BilstatusData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setBilstatus: (data: BilstatusData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBilstatusStore = create<BilstatusState>((set) => ({
  bilstatus: null,
  isLoading: true,
  error: null,

  setBilstatus: (bilstatus) => set({ bilstatus, isLoading: false, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

// Selector hooks
export const useBilstatus = () => useBilstatusStore((state) => state.bilstatus);
export const useBilstatusLoading = () => useBilstatusStore((state) => state.isLoading);
export const useBilstatusError = () => useBilstatusStore((state) => state.error);
