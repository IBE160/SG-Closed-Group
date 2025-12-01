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
import { Pencil, Plus, Radio, Trash2 } from "lucide-react";
import { useTalegrupperStore, type Talegruppe } from "@/stores/useTalegrupperStore";

/**
 * TalegrupperSection Component
 * Displays and manages radio talk groups (talegrupper)
 *
 * OPTIMIZED: Uses centralized Zustand store for SSE updates.
 * NO local EventSource - SSEProvider handles all SSE connections.
 *
 * All logged-in users can edit (not just admin)
 */
function TalegrupperSectionComponent() {
  useSession(); // Keep session for auth check

  // Use centralized store for talegrupper data
  const talegrupper = useTalegrupperStore((state) => state.talegrupper);
  const isLoading = useTalegrupperStore((state) => state.isLoading);
  const error = useTalegrupperStore((state) => state.error);
  const setTalegrupper = useTalegrupperStore((state) => state.setTalegrupper);
  const setStoreLoading = useTalegrupperStore((state) => state.setLoading);
  const setStoreError = useTalegrupperStore((state) => state.setError);

  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTalegruppe, setEditingTalegruppe] = useState<Talegruppe | null>(null);
  const [editName, setEditName] = useState("");
  const [editDetails, setEditDetails] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTalegruppe, setDeletingTalegruppe] = useState<Talegruppe | null>(null);

  // Fetch talegrupper from API (initial load only)
  const fetchTalegrupper = useCallback(async () => {
    try {
      const response = await fetch("/api/talegrupper");
      const data = await response.json();

      if (data.success) {
        setTalegrupper(data.data);
      } else {
        setStoreError(data.error?.message || "Kunne ikke hente talegrupper");
      }
    } catch {
      setStoreError("Nettverksfeil - kunne ikke hente talegrupper");
    }
  }, [setTalegrupper, setStoreError]);

  // Initial fetch only - SSE handles updates
  useEffect(() => {
    setStoreLoading(true);
    fetchTalegrupper();
  }, [fetchTalegrupper, setStoreLoading]);

  // Add/Edit handlers
  const openAddDialog = () => {
    setEditingTalegruppe(null);
    setEditName("");
    setEditDetails("");
    setDialogOpen(true);
    setActionError(null);
  };

  const openEditDialog = (talegruppe: Talegruppe) => {
    setEditingTalegruppe(talegruppe);
    setEditName(talegruppe.name);
    setEditDetails(talegruppe.details);
    setDialogOpen(true);
    setActionError(null);
  };

  const handleSubmit = async () => {
    if (!editName.trim() || !editDetails.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const isEdit = !!editingTalegruppe;
      const url = isEdit ? `/api/talegrupper/${editingTalegruppe.id}` : "/api/talegrupper";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          details: editDetails.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDialogOpen(false);
        // SSE will handle the update
      } else {
        setActionError(data.error?.message || "Kunne ikke lagre");
      }
    } catch {
      setActionError("Nettverksfeil");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const openDeleteDialog = (talegruppe: Talegruppe) => {
    setDeletingTalegruppe(talegruppe);
    setDeleteDialogOpen(true);
    setActionError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTalegruppe) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/talegrupper/${deletingTalegruppe.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setDeleteDialogOpen(false);
        setDeletingTalegruppe(null);
        // SSE will handle the update
      } else {
        setActionError(data.error?.message || "Kunne ikke slette");
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
          <CardTitle className="text-lg font-semibold">Talegrupper</CardTitle>
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
          <CardTitle className="text-lg font-semibold">Talegrupper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm">
            Laster talegrupper...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Talegrupper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={openAddDialog}
              title="Legg til talegruppe"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {talegrupper.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm">
              Ingen talegrupper registrert
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-1" />
                  Legg til
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {talegrupper.map((talegruppe) => (
                <div
                  key={talegruppe.id}
                  className="flex justify-between items-start p-2 rounded-md border bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-primary">
                      {talegruppe.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {talegruppe.details}
                    </div>
                    {/* Show who created/updated */}
                    {talegruppe.createdByName && (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        Opprettet av {talegruppe.createdByName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => openEditDialog(talegruppe)}
                      title="Rediger"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(talegruppe)}
                      title="Slett"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTalegruppe ? "Rediger talegruppe" : "Legg til talegruppe"}
            </DialogTitle>
            <DialogDescription>
              {editingTalegruppe
                ? "Oppdater informasjon om talegruppen"
                : "Legg til en ny talegruppe"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="F.eks. Skogbrann-01"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="details">Detaljer</Label>
              <Input
                id="details"
                value={editDetails}
                onChange={(e) => setEditDetails(e.target.value)}
                placeholder="F.eks. 06-Brann-19"
              />
            </div>

            {actionError && (
              <div className="text-sm text-destructive">{actionError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Avbryt
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !editName.trim() || !editDetails.trim()}
            >
              {isSubmitting ? "Lagrer..." : "Lagre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bekreft sletting</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette talegruppen &quot;{deletingTalegruppe?.name}&quot;?
              Denne handlingen kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <div className="text-sm text-destructive py-2">{actionError}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Sletter..." : "Slett"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const TalegrupperSection = memo(TalegrupperSectionComponent);
