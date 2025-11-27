"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GreyStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  existingNote?: string | null;
  onSubmit: (note: string) => void;
  isLoading?: boolean;
}

/**
 * GreyStatusDialog Component
 * Dialog for entering/editing the reason note when setting a vehicle to grey (out of service)
 */
export function GreyStatusDialog({
  open,
  onOpenChange,
  vehicleId,
  existingNote,
  onSubmit,
  isLoading = false,
}: GreyStatusDialogProps) {
  const [note, setNote] = useState(existingNote ?? "");
  const isEditing = !!existingNote;

  // Reset note when dialog opens
  useEffect(() => {
    if (open) {
      setNote(existingNote ?? "");
    }
  }, [open, existingNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      onSubmit(note.trim());
    }
  };

  const isValid = note.trim().length >= 1 && note.trim().length <= 50;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Rediger notat" : "Sett ute av drift"} - {vehicleId}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Oppdater grunnen til at kjøretøyet er ute av drift."
                : "Skriv inn grunnen til at kjøretøyet er ute av drift."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note">Grunn (påkrevd)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="F.eks. Verksted, service, utlånt..."
                maxLength={50}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {note.length}/50 tegn
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? "Lagrer..." : isEditing ? "Oppdater" : "Bekreft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
