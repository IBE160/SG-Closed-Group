"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { VehicleStatusBox } from "@/components/bilstatus/VehicleStatusBox";
import { GreyStatusDialog } from "@/components/bilstatus/GreyStatusDialog";
import { useBilstatusStore } from "@/stores/useBilstatusStore";

interface GreyDialogState {
  open: boolean;
  vehicleId: "S111" | "S112" | null;
  existingNote: string | null;
}

/**
 * BilstatusSection Component
 * Displays vehicle status for S111 and S112 with real-time SSE updates
 *
 * OPTIMIZED: Uses centralized Zustand store for SSE updates.
 * NO local EventSource - SSEProvider handles all SSE connections.
 */
function BilstatusSectionComponent() {
  // Use centralized store for bilstatus data
  const bilstatus = useBilstatusStore((state) => state.bilstatus);
  const isLoading = useBilstatusStore((state) => state.isLoading);
  const error = useBilstatusStore((state) => state.error);
  const setBilstatus = useBilstatusStore((state) => state.setBilstatus);
  const setStoreLoading = useBilstatusStore((state) => state.setLoading);
  const setStoreError = useBilstatusStore((state) => state.setError);

  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [greyDialog, setGreyDialog] = useState<GreyDialogState>({
    open: false,
    vehicleId: null,
    existingNote: null,
  });

  // Fetch bilstatus from API (initial load only - SSE handles updates)
  const fetchBilstatus = useCallback(async () => {
    try {
      const response = await fetch("/api/bilstatus");
      const data = await response.json();

      if (data.success) {
        setBilstatus(data.data);
      } else {
        setStoreError(data.error?.message || "Kunne ikke hente bilstatus");
      }
    } catch {
      setStoreError("Nettverksfeil - kunne ikke hente bilstatus");
    }
  }, [setBilstatus, setStoreError]);

  // Initial fetch + polling fallback (SSE doesn't work reliably on Vercel)
  useEffect(() => {
    setStoreLoading(true);
    fetchBilstatus();

    // Polling fallback every 2 seconds
    const pollingInterval = setInterval(fetchBilstatus, 2000);

    return () => clearInterval(pollingInterval);
  }, [fetchBilstatus, setStoreLoading]);

  // Toggle vehicle status
  const handleToggle = async (vehicleId: "S111" | "S112") => {
    if (isToggling) return;

    setIsToggling(vehicleId);
    try {
      const response = await fetch("/api/bilstatus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle: vehicleId, action: "toggle" }),
      });

      const data = await response.json();

      if (data.success) {
        setBilstatus(data.data);
      } else {
        console.error("[BilstatusSection] Toggle failed:", data.error);
      }
    } catch (err) {
      console.error("[BilstatusSection] Toggle error:", err);
    } finally {
      setIsToggling(null);
    }
  };

  // Open dialog to set grey status
  const handleSetGrey = (vehicleId: "S111" | "S112") => {
    setGreyDialog({
      open: true,
      vehicleId,
      existingNote: null,
    });
  };

  // Open dialog to edit existing note
  const handleEditNote = (vehicleId: "S111" | "S112") => {
    const currentNote = bilstatus?.[vehicleId]?.note ?? null;
    setGreyDialog({
      open: true,
      vehicleId,
      existingNote: currentNote,
    });
  };

  // Submit grey status with note
  const handleGreySubmit = async (note: string) => {
    if (!greyDialog.vehicleId || isToggling) return;

    setIsToggling(greyDialog.vehicleId);
    try {
      const response = await fetch("/api/bilstatus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle: greyDialog.vehicleId,
          action: "set_grey",
          note,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBilstatus(data.data);
        setGreyDialog({ open: false, vehicleId: null, existingNote: null });
        setActionError(null);
      } else {
        setActionError(data.error?.message || "Kunne ikke sette ute av drift");
        setGreyDialog({ open: false, vehicleId: null, existingNote: null });
      }
    } catch (err) {
      console.error("[BilstatusSection] Set grey error:", err);
      setActionError("Nettverksfeil - prøv igjen");
    } finally {
      setIsToggling(null);
    }
  };

  // Clear grey status
  const handleClearGrey = async (vehicleId: "S111" | "S112") => {
    if (isToggling) return;

    setIsToggling(vehicleId);
    try {
      const response = await fetch("/api/bilstatus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle: vehicleId, action: "clear_grey" }),
      });

      const data = await response.json();

      if (data.success) {
        setBilstatus(data.data);
      } else {
        console.error("[BilstatusSection] Clear grey failed:", data.error);
      }
    } catch (err) {
      console.error("[BilstatusSection] Clear grey error:", err);
    } finally {
      setIsToggling(null);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Bilstatus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Bilstatus</CardTitle>
        </CardHeader>
        <CardContent>
          {actionError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{actionError}</span>
                <button
                  onClick={() => setActionError(null)}
                  className="ml-2 hover:opacity-70"
                  aria-label="Lukk feilmelding"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <VehicleStatusBox
              vehicleId="S111"
              status={bilstatus?.S111?.status ?? "OUT"}
              note={bilstatus?.S111?.note}
              onClick={() => handleToggle("S111")}
              onSetGrey={() => handleSetGrey("S111")}
              onClearGrey={() => handleClearGrey("S111")}
              onEditNote={() => handleEditNote("S111")}
              isLoading={isLoading || isToggling === "S111"}
            />
            <VehicleStatusBox
              vehicleId="S112"
              status={bilstatus?.S112?.status ?? "OUT"}
              note={bilstatus?.S112?.note}
              onClick={() => handleToggle("S112")}
              onSetGrey={() => handleSetGrey("S112")}
              onClearGrey={() => handleClearGrey("S112")}
              onEditNote={() => handleEditNote("S112")}
              isLoading={isLoading || isToggling === "S112"}
            />
          </div>
        </CardContent>
      </Card>

      <GreyStatusDialog
        open={greyDialog.open}
        onOpenChange={(open) =>
          setGreyDialog((prev) => ({ ...prev, open }))
        }
        vehicleId={greyDialog.vehicleId ?? "S111"}
        existingNote={greyDialog.existingNote}
        onSubmit={handleGreySubmit}
        isLoading={isToggling !== null}
      />
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const BilstatusSection = memo(BilstatusSectionComponent);
