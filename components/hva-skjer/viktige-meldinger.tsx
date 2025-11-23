import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ViktigeMeldinger() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-emergency-heading">Viktige meldinger</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {/* Placeholder - Event list will be implemented in Epic 3 */}
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg">Ingen aktive meldinger</p>
            <p className="text-sm mt-2">
              Hendelser vises her når de opprettes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
