"use client";

import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type VehicleStatus = "READY" | "OUT" | "OUT_OF_SERVICE";

interface VehicleStatusBoxProps {
  vehicleId: string;
  status: VehicleStatus;
  note?: string | null;
  onClick?: () => void;
  onSetGrey?: () => void;
  onClearGrey?: () => void;
  onEditNote?: () => void;
  isLoading?: boolean;
}

/**
 * VehicleStatusBox Component
 * Displays a single vehicle status box with color-coded status
 *
 * Colors:
 * - Green: This vehicle goes on next call
 * - Red: Other vehicle goes on next call
 * - Grey: Out of service (shows note)
 *
 * Click to toggle which vehicle goes next
 * Right-click for context menu with grey status options
 */
export function VehicleStatusBox({
  vehicleId,
  status,
  note,
  onClick,
  onSetGrey,
  onClearGrey,
  onEditNote,
  isLoading = false,
}: VehicleStatusBoxProps) {
  const isClickable = status !== "OUT_OF_SERVICE" && !isLoading;
  const isOutOfService = status === "OUT_OF_SERVICE";

  // Status color mapping
  const statusColors = {
    READY: "bg-green-500 hover:bg-green-600 border-green-600",
    OUT: "bg-red-500 hover:bg-red-600 border-red-600",
    OUT_OF_SERVICE: "bg-gray-400 border-gray-500",
  };

  const boxContent = (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        "flex h-24 w-full flex-col items-center justify-center rounded-lg border-2 transition-all",
        statusColors[status],
        isClickable && "cursor-pointer active:scale-95",
        !isClickable && "cursor-default",
        isLoading && "animate-pulse"
      )}
    >
      <span className="text-3xl font-bold text-white drop-shadow-sm">
        {vehicleId}
      </span>
      {isLoading && (
        <span className="mt-1 text-sm font-medium text-white/90">
          Laster...
        </span>
      )}
      {isOutOfService && note && (
        <span className="mt-1 text-xs font-medium text-white/90">
          {note}
        </span>
      )}
    </button>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {boxContent}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {isOutOfService ? (
          <>
            <ContextMenuItem onClick={onEditNote}>
              Rediger notat
            </ContextMenuItem>
            <ContextMenuItem onClick={onClearGrey}>
              Fjern ute av drift
            </ContextMenuItem>
          </>
        ) : (
          <ContextMenuItem onClick={onSetGrey}>
            Sett ute av drift
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
