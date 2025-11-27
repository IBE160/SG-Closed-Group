"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/events/EventList";
import { EventForm } from "@/components/events/EventForm";

type PriorityFilter = "ALL" | "CRITICAL";
const FILTER_STORAGE_KEY = "event-filter-priority";

export function ViktigeMeldinger() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");

  // Load filter preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved === "CRITICAL" || saved === "ALL") {
      setPriorityFilter(saved);
    }
  }, []);

  // Save filter preference to localStorage when it changes
  const handleFilterChange = (filter: PriorityFilter) => {
    setPriorityFilter(filter);
    localStorage.setItem(FILTER_STORAGE_KEY, filter);
  };

  const handleEventCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-emergency-heading">Viktige meldinger</CardTitle>
          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <div className="flex rounded-md border border-input overflow-hidden">
              <Button
                variant={priorityFilter === "ALL" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8 px-3"
                onClick={() => handleFilterChange("ALL")}
              >
                Alle
              </Button>
              <Button
                variant={priorityFilter === "CRITICAL" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8 px-3 border-l"
                onClick={() => handleFilterChange("CRITICAL")}
              >
                Pri 1
              </Button>
            </div>
            <EventForm onSuccess={handleEventCreated} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <EventList
          className="h-full"
          refreshTrigger={refreshTrigger}
          priorityFilter={priorityFilter}
        />
      </CardContent>
    </Card>
  );
}
