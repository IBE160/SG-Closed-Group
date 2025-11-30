"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getISOWeek, getYear, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil, Phone, User } from "lucide-react";

interface VaktplanData {
  id: string | null;
  week: number;
  year: number;
  vakt09Name: string | null;
  lederstotteName: string | null;
  lederstottePhone: string | null;
  updatedByName: string | null;
  updatedAt: string | null;
}

interface SSEEvent {
  type: string;
  data: {
    week: number;
    year: number;
    vakt09Name: string | null;
    lederstotteName: string | null;
    lederstottePhone: string | null;
    updatedByName: string | null;
    updatedAt: string | null;
  };
  timestamp: string;
}

/**
 * VaktplanSection Component
 * Displays current week's duty roster with fixed fields:
 * - Vakt09: name only
 * - Lederstøtte: name + phone
 *
 * Story 3.6: Vaktplan - Duty Roster Display
 * Story 3.7: Vaktplan - User Editing (all users)
 *
 * UPDATED 2025-11-27: Changed from generic positions to fixed fields
 * UPDATED 2025-11-30: All logged-in users can edit (not just admin)
 */
export function VaktplanSection() {
  useSession(); // Keep session for auth check
  const [vaktplan, setVaktplan] = useState<VaktplanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Week navigation state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedWeek = getISOWeek(selectedDate);
  const selectedYear = getYear(selectedDate);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVakt09Name, setEditVakt09Name] = useState("");
  const [editLederstotteName, setEditLederstotteName] = useState("");
  const [editLederstottePhone, setEditLederstottePhone] = useState("");

  // SSE connection ref
  const eventSourceRef = useRef<EventSource | null>(null);

  // All logged-in users can edit (not admin-only anymore)

  // Fetch vaktplan from API
  const fetchVaktplan = useCallback(async () => {
    try {
      const response = await fetch(`/api/vaktplan?week=${selectedWeek}&year=${selectedYear}`);
      const data = await response.json();

      if (data.success) {
        setVaktplan(data.data);
        setError(null);
      } else {
        setError(data.error?.message || "Kunne ikke hente vaktplan");
      }
    } catch {
      setError("Nettverksfeil - kunne ikke hente vaktplan");
    } finally {
      setIsLoading(false);
    }
  }, [selectedWeek, selectedYear]);

  // Fetch on mount and when week changes
  useEffect(() => {
    setIsLoading(true);
    fetchVaktplan();
  }, [fetchVaktplan]);

  // SSE subscription for real-time updates
  useEffect(() => {
    const eventSource = new EventSource("/api/sse");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const sseEvent: SSEEvent = JSON.parse(event.data);
        if (sseEvent.type === "vaktplan_update") {
          // Only update if it matches current week/year
          if (sseEvent.data.week === selectedWeek && sseEvent.data.year === selectedYear) {
            setVaktplan((prev) => ({
              ...prev,
              id: prev?.id ?? null,
              week: sseEvent.data.week,
              year: sseEvent.data.year,
              vakt09Name: sseEvent.data.vakt09Name,
              lederstotteName: sseEvent.data.lederstotteName,
              lederstottePhone: sseEvent.data.lederstottePhone,
              updatedByName: sseEvent.data.updatedByName,
              updatedAt: sseEvent.data.updatedAt,
            }));
          }
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // Reconnect after error
      eventSource.close();
      setTimeout(() => {
        eventSourceRef.current = new EventSource("/api/sse");
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [selectedWeek, selectedYear]);

  // Week navigation
  const goToPreviousWeek = () => {
    setSelectedDate((prev) => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setSelectedDate((prev) => addWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setSelectedDate(new Date());
  };

  // Get current week for comparison
  const now = new Date();
  const currentWeek = getISOWeek(now);
  const currentYear = getYear(now);
  const isCurrentWeek = selectedWeek === currentWeek && selectedYear === currentYear;

  // Edit handlers
  const openEditDialog = () => {
    setEditVakt09Name(vaktplan?.vakt09Name || "");
    setEditLederstotteName(vaktplan?.lederstotteName || "");
    setEditLederstottePhone(vaktplan?.lederstottePhone || "");
    setEditDialogOpen(true);
    setActionError(null);
  };

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch("/api/vaktplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week: selectedWeek,
          year: selectedYear,
          vakt09Name: editVakt09Name.trim() || null,
          lederstotteName: editLederstotteName.trim() || null,
          lederstottePhone: editLederstottePhone.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEditDialogOpen(false);
        // SSE will handle the update
      } else {
        setActionError(data.error?.message || "Kunne ikke oppdatere");
      }
    } catch {
      setActionError("Nettverksfeil");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error state
  if (error) {
    return (
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Vaktplan - Uke {selectedWeek}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Vaktplan - Uke {selectedWeek}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm">
            Laster vaktplan...
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayWeek = vaktplan?.week ?? selectedWeek;
  const displayYear = vaktplan?.year ?? selectedYear;
  const hasData = vaktplan?.vakt09Name || vaktplan?.lederstotteName;

  return (
    <>
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Vaktplan - Uke {displayWeek}
              {displayYear !== currentYear && ` (${displayYear})`}
            </CardTitle>
            {/* Week navigation - visible to all */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToPreviousWeek}
                title="Forrige uke"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {!isCurrentWeek && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={goToCurrentWeek}
                >
                  I dag
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToNextWeek}
                title="Neste uke"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-1"
                onClick={openEditDialog}
                title="Rediger vaktplan"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="text-center text-muted-foreground text-sm">
              Ingen vaktplan registrert for denne uken
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={openEditDialog}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Legg til
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Vakt09 */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-[80px]">Vakt09:</span>
                <span className="font-medium">
                  {vaktplan?.vakt09Name || <span className="text-muted-foreground italic">Ikke satt</span>}
                </span>
              </div>

              {/* Lederstøtte */}
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground min-w-[80px]">Lederstøtte:</span>
                  <span className="font-medium">
                    {vaktplan?.lederstotteName || <span className="text-muted-foreground italic">Ikke satt</span>}
                  </span>
                </div>
                {vaktplan?.lederstottePhone && (
                  <div className="flex items-center gap-2 text-sm ml-6">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{vaktplan.lederstottePhone}</span>
                  </div>
                )}
              </div>

              {/* Updated by info */}
              {vaktplan?.updatedByName && (
                <div className="border-t pt-2 mt-3 text-xs text-muted-foreground">
                  Sist oppdatert av {vaktplan.updatedByName}
                  {vaktplan.updatedAt && (
                    <span> - {new Date(vaktplan.updatedAt).toLocaleString("nb-NO")}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rediger Vaktplan - Uke {selectedWeek}</DialogTitle>
            <DialogDescription>
              Oppdater vaktplan for uke {selectedWeek}, {selectedYear}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Vakt09 */}
            <div className="grid gap-2">
              <Label htmlFor="vakt09Name">Vakt09</Label>
              <Input
                id="vakt09Name"
                value={editVakt09Name}
                onChange={(e) => setEditVakt09Name(e.target.value)}
                placeholder="Navn på person"
              />
            </div>

            {/* Lederstøtte */}
            <div className="grid gap-2">
              <Label htmlFor="lederstotteName">Lederstøtte - Navn</Label>
              <Input
                id="lederstotteName"
                value={editLederstotteName}
                onChange={(e) => setEditLederstotteName(e.target.value)}
                placeholder="Navn på person"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lederstottePhone">Lederstøtte - Telefon</Label>
              <Input
                id="lederstottePhone"
                value={editLederstottePhone}
                onChange={(e) => setEditLederstottePhone(e.target.value)}
                placeholder="+47 123 45 678"
                type="tel"
              />
            </div>

            {actionError && (
              <div className="text-sm text-destructive">{actionError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Lagrer..." : "Lagre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
