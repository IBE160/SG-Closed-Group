"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { UserProfile } from "./UserProfile";

const tabs = [
  { name: "Hva Skjer", href: "/hva-skjer", shortcut: "1" },
  { name: "Bålmelding", href: "/balmelding", shortcut: "2" },
  { name: "Innstillinger", href: "/innstillinger", shortcut: "3" },
] as const;

export function TabNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Keyboard shortcuts: Ctrl+1, Ctrl+2, Ctrl+3
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        const tab = tabs.find((t) => t.shortcut === e.key);
        if (tab) {
          e.preventDefault();
          router.push(tab.href);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <nav className="flex h-12 items-center justify-between border-b border-border bg-card px-2">
      <div className="flex h-full">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href === "/hva-skjer" && pathname === "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex h-full min-w-[100px] items-center justify-center px-4 text-sm font-medium transition-colors",
                "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {tab.name}
              {/* Active indicator - blue underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-info" />
              )}
            </Link>
          );
        })}
      </div>
      <UserProfile />
    </nav>
  );
}
