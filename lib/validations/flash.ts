/**
 * Flash Message Validation Schema
 * Story 4.1: Flash Message Basic Send and Receive
 */

import { z } from "zod";

export const flashMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Melding kan ikke være tom")
    .max(100, "Melding må være 100 tegn eller mindre")
    .trim(),
});

export type FlashMessageInput = z.infer<typeof flashMessageSchema>;
