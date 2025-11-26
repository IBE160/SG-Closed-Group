"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-slate-700 animate-pulse" />
    );
  }

  if (!session) return null;

  const displayName = session.user?.name || session.user?.email?.split("@")[0] || "Bruker";
  const roleLabel = session.user?.role === "ADMINISTRATOR" ? "Administrator" : "Operatør";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
          <User className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 w-56">
        <DropdownMenuLabel className="text-slate-300">
          {session.user?.email}
        </DropdownMenuLabel>
        <DropdownMenuLabel className="text-xs text-slate-500 font-normal -mt-2">
          Rolle: {roleLabel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          className="text-slate-300 cursor-pointer hover:bg-slate-700 focus:bg-slate-700"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logg ut
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
