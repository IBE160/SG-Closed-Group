"use client";

import { useEffect, useCallback, useMemo, memo } from "react";
import { EventCard } from "./EventCard";
import { useEventsStore } from "@/stores/useEventsStore";

type PriorityFilter = "ALL" | "CRITICAL";

interface EventListProps {
  className?: string;
  refreshTrigger?: number; // Increment to trigger refresh
  priorityFilter?: PriorityFilter; // Filter by priority
}

/**
 * EventList Component
 * Displays a list of events with real-time SSE updates
 * Events are sorted by priority (CRITICAL first) then by createdAt DESC
 *
 * OPTIMIZED: Uses centralized Zustand store for SSE updates.
 * NO local EventSource - SSEProvider handles all SSE connections.
 */
function EventListComponent({ className, refreshTrigger, priorityFilter = "ALL" }: EventListProps) {
  // Use centralized store for events data
  const events = useEventsStore((state) => state.events);
  const isLoading = useEventsStore((state) => state.isLoading);
  const error = useEventsStore((state) => state.error);
  const setEvents = useEventsStore((state) => state.setEvents);
  const setStoreLoading = useEventsStore((state) => state.setLoading);
  const setStoreError = useEventsStore((state) => state.setError);

  // Filter events based on priority filter (memoized)
  const filteredEvents = useMemo(() => {
    return priorityFilter === "CRITICAL"
      ? events.filter((e) => e.priority === "CRITICAL")
      : events;
  }, [events, priorityFilter]);

  // Fetch events from API (initial load only - SSE handles updates)
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      } else {
        setStoreError(data.error?.message || "Kunne ikke hente hendelser");
      }
    } catch {
      setStoreError("Nettverksfeil - kunne ikke hente hendelser");
    }
  }, [setEvents, setStoreError]);

  // Initial fetch + polling fallback (SSE doesn't work reliably on Vercel)
  useEffect(() => {
    setStoreLoading(true);
    fetchEvents();

    // Polling fallback every 2 seconds
    const pollingInterval = setInterval(fetchEvents, 2000);

    return () => clearInterval(pollingInterval);
  }, [fetchEvents, setStoreLoading]);

  // Refetch when refreshTrigger changes (manual refresh from parent)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchEvents();
    }
  }, [refreshTrigger, fetchEvents]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Laster hendelser...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-32">
          <div className="text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className={className}>
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg">
              {priorityFilter === "CRITICAL" ? "Ingen Pri 1 hendelser" : "Ingen hendelser"}
            </p>
            <p className="text-sm mt-2">
              {priorityFilter === "CRITICAL"
                ? "Det er ingen kritiske hendelser for øyeblikket"
                : "Hendelser vises her når de opprettes"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} onUpdate={fetchEvents} />
        ))}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const EventList = memo(EventListComponent);
