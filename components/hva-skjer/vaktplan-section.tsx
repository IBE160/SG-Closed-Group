"use client";

import { useEffect, useState, useCallback, memo } from "react";
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
import { useVaktplanStore } from "@/stores/useVaktplanStore";

/**
 * VaktplanSection Component
 * Displays current week's duty roster with fixed fields:
 * - Vakt09: name only
 * - Lederstøtte: name + phone
 *
 * OPTIMIZED: Uses centralized Zustand store for SSE updates.
 * NO local EventSource - SSEProvider handles all SSE connections.
 */
function VaktplanSectionComponent() {
  const { data: session } = useSession();

  // Use centralized store for vaktplan data
  const vaktplan = useVaktplanStore((state) => state.vaktplan);
  const isLoading = useVaktplanStore((state) => state.isLoading);
  const error = useVaktplanStore((state) => state.error);
  const setVaktplan = useVaktplanStore((state) => state.setVaktplan);
  const setCurrentWeekYear = useVaktplanStore((state) => state.setCurrentWeekYear);
  const setStoreLoading = useVaktplanStore((state) => state.setLoading);
  const setStoreError = useVaktplanStore((state) => state.setError);

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

  const isAdmin = session?.user?.role === "ADMINISTRATOR";

  // Update store with current week/year for SSE filtering
  useEffect(() => {
    setCurrentWeekYear(selectedWeek, selectedYear);
  }, [selectedWeek, selectedYear, setCurrentWeekYear]);

  // Fetch vaktplan from API
  const fetchVaktplan = useCallback(async () => {
    try {
      const response = await fetch(`/api/vaktplan?week=${selectedWeek}&year=${selectedYear}`);
      const data = await response.json();

      if (data.success) {
        setVaktplan(data.data);
      } else {
        setStoreError(data.error?.message || "Kunne ikke hente vaktplan");
      }
    } catch {
      setStoreError("Nettverksfeil - kunne ikke hente vaktplan");
    }
  }, [selectedWeek, selectedYear, setVaktplan, setStoreError]);

  // Fetch on mount and when week changes
  useEffect(() => {
    setStoreLoading(true);
    fetchVaktplan();
  }, [fetchVaktplan, setStoreLoading]);

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
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 ml-1"
                  onClick={openEditDialog}
                  title="Rediger vaktplan"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="text-center text-muted-foreground text-sm">
              Ingen vaktplan registrert for denne uken
              {isAdmin && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={openEditDialog}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Legg til
                  </Button>
                </div>
              )}
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

// Memoize to prevent unnecessary re-renders
export const VaktplanSection = memo(VaktplanSectionComponent);
