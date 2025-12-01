"use client";

import { useEffect, useState, useCallback } from "react";
import { EventCard } from "./EventCard";

interface Event {
  id: string;
  title: string;
  description: string;
  priority: "CRITICAL" | "NORMAL";
  status: "ACTIVE" | "RESOLVED" | "ARCHIVED";
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

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
 */
export function EventList({ className, refreshTrigger, priorityFilter = "ALL" }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter events based on priority filter
  const filteredEvents = priorityFilter === "CRITICAL"
    ? events.filter((e) => e.priority === "CRITICAL")
    : events;

  // Sort events: CRITICAL first, then by createdAt DESC
  const sortEvents = useCallback((eventList: Event[]) => {
    return [...eventList].sort((a, b) => {
      // CRITICAL comes first
      if (a.priority === "CRITICAL" && b.priority !== "CRITICAL") return -1;
      if (a.priority !== "CRITICAL" && b.priority === "CRITICAL") return 1;
      // Then sort by createdAt DESC
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, []);

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();

      if (data.success) {
        setEvents(sortEvents(data.data));
        setError(null);
      } else {
        setError(data.error?.message || "Kunne ikke hente hendelser");
      }
    } catch {
      setError("Nettverksfeil - kunne ikke hente hendelser");
    } finally {
      setIsLoading(false);
    }
  }, [sortEvents]);

  // Refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchEvents();
    }
  }, [refreshTrigger, fetchEvents]);

  // Set up SSE connection for real-time updates + polling fallback
  useEffect(() => {
    fetchEvents();

    // Connect to SSE endpoint
    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (messageEvent) => {
      try {
        const sseEvent = JSON.parse(messageEvent.data);

        if (sseEvent.type === "event_created") {
          // Add new event and re-sort
          setEvents((prev) => sortEvents([sseEvent.data, ...prev]));
        } else if (sseEvent.type === "event_updated") {
          // Update existing event
          setEvents((prev) =>
            sortEvents(
              prev.map((e) => (e.id === sseEvent.data.id ? sseEvent.data : e))
            )
          );
        } else if (sseEvent.type === "event_deleted") {
          // Remove deleted event
          setEvents((prev) =>
            prev.filter((e) => e.id !== sseEvent.data.id)
          );
        }
      } catch (err) {
        console.warn("[EventList] Failed to parse SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("[EventList] SSE connection error, will auto-reconnect");
    };

    // Polling fallback every 30 seconds (for dev mode where SSE broadcast doesn't work across routes)
    // Longer interval to avoid interrupting user interactions like editing
    const pollingInterval = setInterval(() => {
      fetchEvents();
    }, 30000);

    // Cleanup on unmount
    return () => {
      eventSource.close();
      clearInterval(pollingInterval);
    };
  }, [fetchEvents, sortEvents]);

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
