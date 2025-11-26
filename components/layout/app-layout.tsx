"use client";

import { usePathname } from "next/navigation";
import { FlashBar } from "./flash-bar";
import { TabNavigation } from "./tab-navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Offentlige ruter som ikke skal ha intern navigasjon
const PUBLIC_ROUTES = ["/rapporter", "/kart", "/admin"];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Sjekk om vi er på en offentlig rute
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // For offentlige ruter, returner bare children uten navigasjon
  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Flash message bar - always visible at very top */}
      <FlashBar />

      {/* Tab Navigation below flash bar - Excel-style */}
      <TabNavigation />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
