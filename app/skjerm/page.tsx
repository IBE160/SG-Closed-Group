/**
 * Display Mode Page - Read-only view for wall displays
 *
 * Features:
 * - No authentication required
 * - No flash bar, no tabs
 * - Full screen "Hva Skjer" view
 * - Auto-refreshes content via SSE
 * - Optimized for display walls
 *
 * Access: /skjerm
 */

import { SkjermLayout } from "@/components/skjerm/skjerm-layout";

export default function SkjermPage() {
  return <SkjermLayout />;
}
