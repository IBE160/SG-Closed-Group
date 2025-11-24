"use client";

import { FlashBar } from "./flash-bar";
import { TabNavigation } from "./tab-navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
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
