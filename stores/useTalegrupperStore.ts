/**
 * Zustand store for talegrupper (radio talk groups) state management
 * Centralized store for real-time talegrupper updates via SSE
 */

import { create } from "zustand";

export interface Talegruppe {
  id: string;
  name: string;
  details: string;
  createdBy: string | null;
  createdByName: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TalegrupperState {
  talegrupper: Talegruppe[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setTalegrupper: (talegrupper: Talegruppe[]) => void;
  addTalegruppe: (talegruppe: Talegruppe) => void;
  updateTalegruppe: (talegruppe: Talegruppe) => void;
  removeTalegruppe: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTalegrupperStore = create<TalegrupperState>((set) => ({
  talegrupper: [],
  isLoading: true,
  error: null,

  setTalegrupper: (talegrupper) => set({ talegrupper, isLoading: false, error: null }),

  addTalegruppe: (talegruppe) =>
    set((state) => ({
      talegrupper: [talegruppe, ...state.talegrupper],
    })),

  updateTalegruppe: (talegruppe) =>
    set((state) => ({
      talegrupper: state.talegrupper.map((t) =>
        t.id === talegruppe.id ? talegruppe : t
      ),
    })),

  removeTalegruppe: (id) =>
    set((state) => ({
      talegrupper: state.talegrupper.filter((t) => t.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

// Selector hooks
export const useTalegrupper = () => useTalegrupperStore((state) => state.talegrupper);
export const useTalegrupperLoading = () => useTalegrupperStore((state) => state.isLoading);
export const useTalegrupperError = () => useTalegrupperStore((state) => state.error);
