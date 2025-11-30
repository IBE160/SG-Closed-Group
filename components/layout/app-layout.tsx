"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FlashBar } from "./flash-bar";
import { TabNavigation } from "./tab-navigation";
import { useBlinkPhase } from "@/stores/useFlashStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Offentlige ruter som ikke skal ha intern navigasjon
const PUBLIC_ROUTES = ["/rapporter", "/kart", "/admin"];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const blinkPhase = useBlinkPhase();

  /**
   * Global keyboard shortcut: Ctrl+Shift+F to focus flash input
   * Story 4.1: Flash Message Basic Send and Receive
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+F to focus flash input
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        const flashInput = document.getElementById("flash-input");
        if (flashInput) {
          flashInput.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sjekk om vi er på en offentlig rute
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // For offentlige ruter, returner bare children uten navigasjon
  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      {/* Full-screen blink overlay during quick blink phase - Story 4.2 */}
      {blinkPhase === "quick" && (
        <div
          className="fixed inset-0 pointer-events-none z-50 animate-flash-screen"
          aria-hidden="true"
        />
      )}

      {/* Flash message bar - always visible at very top */}
      <FlashBar />

      {/* Tab Navigation below flash bar - Excel-style */}
      <TabNavigation />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
