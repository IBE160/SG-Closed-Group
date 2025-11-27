"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd").max(50, "Maks 50 tegn"),
  description: z.string().max(200, "Maks 200 tegn").default(""),
  priority: z.enum(["CRITICAL", "NORMAL"]),
});

type EventFormData = z.infer<typeof eventFormSchema>;

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

interface EventEditDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * EventEditDialog Component
 * Dialog form for editing existing events
 */
export function EventEditDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: EventEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastEventId = useRef<string | null>(null);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      priority: event.priority,
    },
  });

  // Only reset form when dialog opens or when editing a DIFFERENT event
  // Don't reset when the same event gets updated from polling
  useEffect(() => {
    if (open && event.id !== lastEventId.current) {
      form.reset({
        title: event.title,
        description: event.description,
        priority: event.priority,
      });
      setError(null);
      lastEventId.current = event.id;
    } else if (!open) {
      lastEventId.current = null;
    }
  }, [open, event.id, event.title, event.description, event.priority, form]);

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(result.error?.message || "Kunne ikke oppdatere hendelse");
      }
    } catch {
      setError("Nettverksfeil - prøv igjen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rediger hendelse</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-title" className="text-sm font-medium">
              Tittel <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-title"
              placeholder="Kort beskrivelse av hendelsen"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-description" className="text-sm font-medium">
              Beskrivelse
            </label>
            <Input
              id="edit-description"
              placeholder="Valgfri utdypende informasjon"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-priority" className="text-sm font-medium">
              Prioritet
            </label>
            <Select
              value={form.watch("priority")}
              onValueChange={(value: "CRITICAL" | "NORMAL") =>
                form.setValue("priority", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg prioritet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="CRITICAL">
                  <span className="text-red-600 font-semibold">Pri 1 - Kritisk</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Lagrer..." : "Lagre endringer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
