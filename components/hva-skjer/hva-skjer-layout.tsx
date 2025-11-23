import { ViktigeMeldinger } from "./viktige-meldinger";
import { BilstatusSection } from "./bilstatus-section";
import { VaktplanSection } from "./vaktplan-section";

export function HvaSkjerLayout() {
  return (
    <div className="grid h-[calc(100vh-48px)] grid-cols-[1fr_400px] gap-4 p-4">
      {/* Left Column - Viktige Meldinger (Events) - Full Height */}
      <ViktigeMeldinger />

      {/* Right Column - Bilstatus + Vaktplan */}
      <div className="flex flex-col gap-4">
        {/* Top Right - Bilstatus */}
        <BilstatusSection />

        {/* Bottom Right - Vaktplan */}
        <VaktplanSection />
      </div>
    </div>
  );
}
