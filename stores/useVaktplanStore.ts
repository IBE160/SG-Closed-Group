/**
 * Zustand store for vaktplan (duty roster) state management
 * Centralized store for real-time vaktplan updates via SSE
 */

import { create } from "zustand";

export interface VaktplanData {
  id: string | null;
  week: number;
  year: number;
  vakt09Name: string | null;
  lederstotteName: string | null;
  lederstottePhone: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
  updatedAt: string | null;
}

interface VaktplanState {
  vaktplan: VaktplanData | null;
  currentWeek: number;
  currentYear: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setVaktplan: (data: VaktplanData) => void;
  updateVaktplanFromSSE: (data: Partial<VaktplanData> & { week: number; year: number }) => void;
  setCurrentWeekYear: (week: number, year: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVaktplanStore = create<VaktplanState>((set, get) => ({
  vaktplan: null,
  currentWeek: 0,
  currentYear: 0,
  isLoading: true,
  error: null,

  setVaktplan: (vaktplan) => set({ vaktplan, isLoading: false, error: null }),

  updateVaktplanFromSSE: (data) => {
    const { currentWeek, currentYear } = get();
    // Only update if SSE data matches current displayed week/year
    if (data.week === currentWeek && data.year === currentYear) {
      set((state) => ({
        vaktplan: {
          ...state.vaktplan,
          id: state.vaktplan?.id ?? null,
          week: data.week,
          year: data.year,
          vakt09Name: data.vakt09Name ?? null,
          lederstotteName: data.lederstotteName ?? null,
          lederstottePhone: data.lederstottePhone ?? null,
          updatedBy: data.updatedBy ?? null,
          updatedByName: data.updatedByName ?? null,
          updatedAt: data.updatedAt ?? null,
        },
      }));
    }
  },

  setCurrentWeekYear: (week, year) => set({ currentWeek: week, currentYear: year }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

// Selector hooks
export const useVaktplan = () => useVaktplanStore((state) => state.vaktplan);
export const useVaktplanLoading = () => useVaktplanStore((state) => state.isLoading);
export const useVaktplanError = () => useVaktplanStore((state) => state.error);
