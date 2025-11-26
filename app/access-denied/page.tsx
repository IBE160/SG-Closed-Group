import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-500">
            Ingen tilgang
          </CardTitle>
          <CardDescription className="text-slate-400">
            Du har ikke tilgang til denne applikasjonen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300 text-center">
            Din e-postadresse er ikke registrert i systemet.
            Kontakt administrator for å få tilgang.
          </p>
          <div className="text-center">
            <Link href="/login">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Tilbake til innlogging
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
