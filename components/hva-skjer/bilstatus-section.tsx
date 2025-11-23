import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BilstatusSection() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Bilstatus</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Placeholder - Vehicle status boxes will be implemented in Story 3.4 */}
        <div className="grid grid-cols-2 gap-4">
          {/* S111 Box */}
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
            <div className="text-center">
              <p className="text-xl font-bold text-muted-foreground">S111</p>
              <p className="text-xs text-muted-foreground/70">Status kommer</p>
            </div>
          </div>

          {/* S112 Box */}
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
            <div className="text-center">
              <p className="text-xl font-bold text-muted-foreground">S112</p>
              <p className="text-xs text-muted-foreground/70">Status kommer</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
