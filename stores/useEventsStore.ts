/**
 * Zustand store for events state management
 * Centralized store for real-time event updates via SSE
 */

import { create } from "zustand";

export interface Event {
  id: string;
  title: string;
  description: string;
  priority: "CRITICAL" | "NORMAL";
  status: "ACTIVE" | "RESOLVED" | "ARCHIVED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  removeEvent: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Sort events: CRITICAL first, then by createdAt DESC
function sortEvents(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (a.priority === "CRITICAL" && b.priority !== "CRITICAL") return -1;
    if (a.priority !== "CRITICAL" && b.priority === "CRITICAL") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  isLoading: true,
  error: null,

  setEvents: (events) => set({ events: sortEvents(events), isLoading: false, error: null }),

  addEvent: (event) =>
    set((state) => ({
      events: sortEvents([event, ...state.events]),
    })),

  updateEvent: (event) =>
    set((state) => ({
      events: sortEvents(
        state.events.map((e) => (e.id === event.id ? event : e))
      ),
    })),

  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

// Selector hooks
export const useEvents = () => useEventsStore((state) => state.events);
export const useEventsLoading = () => useEventsStore((state) => state.isLoading);
export const useEventsError = () => useEventsStore((state) => state.error);
