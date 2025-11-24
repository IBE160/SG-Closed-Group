import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VaktplanSection() {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Vaktplan</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Placeholder - Duty roster will be implemented in Story 3.6 */}
        <div className="space-y-2">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-sm text-muted-foreground">Vakthavende brannsjef</span>
            <span className="text-sm font-medium">-</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-sm text-muted-foreground">Innsatsleder brann</span>
            <span className="text-sm font-medium">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Overordnet vakt</span>
            <span className="text-sm font-medium">-</span>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground/70">
          Vaktliste lastes fra database
        </p>
      </CardContent>
    </Card>
  );
}
