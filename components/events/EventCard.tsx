"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventEditDialog } from "./EventEditDialog";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  priority: "CRITICAL" | "NORMAL";
  status: "ACTIVE" | "RESOLVED" | "ARCHIVED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface EventCardProps {
  event: Event;
  onUpdate?: () => void;
}

/**
 * EventCard Component
 * Displays a single event with priority-based styling
 * Includes edit and delete actions via dropdown menu
 */
export function EventCard({ event, onUpdate }: EventCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCritical = event.priority === "CRITICAL";

  // Format timestamp for display
  const formattedTime = new Date(event.createdAt).toLocaleString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setDeleteDialogOpen(false);
        onUpdate?.();
      } else {
        console.error("[EventCard] Delete failed:", result.error);
      }
    } catch (error) {
      console.error("[EventCard] Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "transition-all",
          isCritical
            ? "border-red-500 bg-red-50 dark:bg-red-950/20 border-2"
            : "border-border"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isCritical && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-bold bg-red-600 text-white">
                    Pri 1
                  </span>
                )}
                <h3
                  className={cn(
                    "font-bold text-lg",
                    isCritical ? "text-red-600 dark:text-red-400" : "text-foreground"
                  )}
                >
                  {event.title}
                </h3>
              </div>
              {event.description && (
                <p className="text-base mt-1 text-white">
                  {event.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <time className="text-sm text-muted-foreground whitespace-nowrap">
                {formattedTime}
              </time>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Flere valg</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rediger
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Slett
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EventEditDialog
        event={event}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={onUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett hendelse</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette &quot;{event.title}&quot;? Denne
              handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Sletter..." : "Slett"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
