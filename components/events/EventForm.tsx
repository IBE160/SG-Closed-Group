"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  priority: z.enum(["CRITICAL", "NORMAL"]).default("NORMAL"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  onSuccess?: () => void;
}

/**
 * EventForm Component
 * Dialog form for creating new events
 */
export function EventForm({ onSuccess }: EventFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "NORMAL",
    },
  });

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        form.reset();
        setOpen(false);
        onSuccess?.();
      } else {
        setError(result.error?.message || "Kunne ikke opprette hendelse");
      }
    } catch {
      setError("Nettverksfeil - prøv igjen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Ny hendelse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opprett ny hendelse</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Tittel <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
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
            <label htmlFor="description" className="text-sm font-medium">
              Beskrivelse
            </label>
            <Input
              id="description"
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
            <label htmlFor="priority" className="text-sm font-medium">
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
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Oppretter..." : "Opprett hendelse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
