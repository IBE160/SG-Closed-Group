"use client";

/**
 * SkjermLayout - Display-only layout for wall displays
 *
 * Features:
 * - Full screen view (no flash bar, no tabs)
 * - Shows all Hva Skjer components
 * - Read-only (no interactive elements)
 * - Auto-refreshes via existing SSE connections
 * - Dark mode optimized
 */

import { ViktigeMeldinger } from "@/components/hva-skjer/viktige-meldinger";
import { BilstatusSection } from "@/components/hva-skjer/bilstatus-section";
import { VaktplanSection } from "@/components/hva-skjer/vaktplan-section";
import { TalegrupperSection } from "@/components/hva-skjer/talegrupper-section";

export function SkjermLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with title */}
      <header className="bg-card border-b border-border px-6 py-3">
        <h1 className="text-2xl font-bold text-foreground">
          Hva Skjer - Skjermvisning
        </h1>
        <p className="text-sm text-muted-foreground">
          Sanntidsoppdatering aktiv
        </p>
      </header>

      {/* Main content - same layout as Hva Skjer */}
      <div className="grid h-[calc(100vh-76px)] grid-cols-[1fr_400px] gap-4 p-4">
        {/* Left Column - Viktige Meldinger (Events) - Full Height */}
        <ViktigeMeldinger />

        {/* Right Column - Bilstatus + Vaktplan + Talegrupper */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Top Right - Bilstatus */}
          <BilstatusSection />

          {/* Middle Right - Vaktplan */}
          <VaktplanSection />

          {/* Bottom Right - Talegrupper */}
          <TalegrupperSection />
        </div>
      </div>
    </div>
  );
}
