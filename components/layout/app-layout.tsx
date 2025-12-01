"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { FlashBar } from "./flash-bar";
import { TabNavigation } from "./tab-navigation";
import { useFlashStore, useFullScreenFlash, useCurrentMessage } from "@/stores/useFlashStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Offentlige ruter som ikke skal ha intern navigasjon
const PUBLIC_ROUTES = ["/rapporter", "/kart", "/admin", "/skjerm", "/login", "/access-denied"];

// 20 seconds in milliseconds
const FLASH_DURATION_MS = 20000;

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const fullScreenFlash = useFullScreenFlash();
  const currentMessage = useCurrentMessage();
  const { acknowledge, stopFullScreenFlash, setBlinkPhase } = useFlashStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle click on the full-screen flash overlay
   * Acknowledges the current message and stops the flash
   */
  const handleOverlayClick = useCallback(() => {
    if (currentMessage) {
      acknowledge(currentMessage.id);
      setBlinkPhase("none");
      stopFullScreenFlash();
    }
  }, [currentMessage, acknowledge, setBlinkPhase, stopFullScreenFlash]);

  /**
   * Auto-stop full-screen flash after 20 seconds
   * Message remains visible but flashing stops
   */
  useEffect(() => {
    if (fullScreenFlash) {
      // Start 20-second timer
      timerRef.current = setTimeout(() => {
        stopFullScreenFlash();
        setBlinkPhase("none");
      }, FLASH_DURATION_MS);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [fullScreenFlash, stopFullScreenFlash, setBlinkPhase]);

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
      {/* Full-screen flash overlay - 20 seconds or until click to acknowledge - Story 4.2 */}
      {fullScreenFlash && (
        <div
          className="fixed inset-0 z-50 animate-flash-screen cursor-pointer"
          onClick={handleOverlayClick}
          role="button"
          aria-label="Klikk for å kvittere flash-melding"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleOverlayClick();
            }
          }}
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
