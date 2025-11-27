/**
 * Bilstatus API - Vehicle Status Display and Toggle
 * Story 3.4: Bilstatus - Vehicle Rotation Status Display and Toggle
 *
 * GET /api/bilstatus - Fetch status for both vehicles (S111, S112)
 * PATCH /api/bilstatus - Toggle vehicle status
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sse";
import { z } from "zod";
import { runWithAuditContext } from "@/lib/audit-context";

// Vehicle IDs
const VEHICLES = ["S111", "S112"] as const;

// Zod validation schemas for actions
const toggleSchema = z.object({
  vehicle: z.enum(VEHICLES),
  action: z.literal("toggle"),
});

const setGreySchema = z.object({
  vehicle: z.enum(VEHICLES),
  action: z.literal("set_grey"),
  note: z.string().min(1, "Notat er påkrevd").max(50, "Notat kan være maks 50 tegn"),
});

const clearGreySchema = z.object({
  vehicle: z.enum(VEHICLES),
  action: z.literal("clear_grey"),
});

// Combined action schema
const actionSchema = z.discriminatedUnion("action", [
  toggleSchema,
  setGreySchema,
  clearGreySchema,
]);

/**
 * Initialize vehicle status records if they don't exist
 * Default: S111 = READY (green), S112 = OUT (red)
 */
async function ensureVehiclesExist() {
  const existingVehicles = await prisma.vehicleStatus.findMany({
    where: { vehicleId: { in: [...VEHICLES] } },
  });

  const existingIds = existingVehicles.map((v) => v.vehicleId);
  const missingVehicles = VEHICLES.filter((id) => !existingIds.includes(id));

  if (missingVehicles.length > 0) {
    await prisma.vehicleStatus.createMany({
      data: missingVehicles.map((vehicleId, index) => ({
        vehicleId,
        status: index === 0 ? "READY" : "OUT", // S111 = READY, S112 = OUT
        updatedBy: "system",
      })),
    });
  }
}

/**
 * Format vehicle status for API response
 */
function formatVehicleStatus(vehicles: { vehicleId: string; status: string; note: string | null; updatedAt: Date }[]) {
  const result: Record<string, { status: string; note: string | null; updatedAt: string }> = {};
  for (const vehicle of vehicles) {
    result[vehicle.vehicleId] = {
      status: vehicle.status,
      note: vehicle.note,
      updatedAt: vehicle.updatedAt.toISOString(),
    };
  }
  return result;
}

/**
 * GET /api/bilstatus
 * Fetch status for both vehicles
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Du må være logget inn", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    // Ensure vehicles exist in database
    await ensureVehiclesExist();

    const vehicles = await prisma.vehicleStatus.findMany({
      where: { vehicleId: { in: [...VEHICLES] } },
    });

    return NextResponse.json({
      success: true,
      data: formatVehicleStatus(vehicles),
    });
  } catch (error) {
    console.error("[BILSTATUS]", "Fetch failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke hente bilstatus", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bilstatus
 * Handle vehicle status actions: toggle, set_grey, clear_grey
 *
 * Actions:
 * - toggle: Switch which vehicle is READY (green) vs OUT (red)
 * - set_grey: Mark vehicle as OUT_OF_SERVICE with required note
 * - clear_grey: Restore vehicle from OUT_OF_SERVICE to READY
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Du må være logget inn", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = actionSchema.parse(body);
    const { vehicle, action } = validated;

    // Ensure vehicles exist
    await ensureVehiclesExist();

    // Get current status of both vehicles
    const vehicles = await prisma.vehicleStatus.findMany({
      where: { vehicleId: { in: [...VEHICLES] } },
    });

    const targetVehicle = vehicles.find((v) => v.vehicleId === vehicle);
    const otherVehicle = vehicles.find((v) => v.vehicleId !== vehicle);

    if (!targetVehicle || !otherVehicle) {
      return NextResponse.json(
        { success: false, error: { message: "Kjøretøy ikke funnet", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // Handle different actions
    if (action === "toggle") {
      return handleToggle(session, targetVehicle, otherVehicle, vehicles);
    } else if (action === "set_grey") {
      const note = (validated as z.infer<typeof setGreySchema>).note;
      return handleSetGrey(session, targetVehicle, otherVehicle, note);
    } else if (action === "clear_grey") {
      return handleClearGrey(session, targetVehicle);
    }

    return NextResponse.json(
      { success: false, error: { message: "Ukjent handling", code: "INVALID_ACTION" } },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, error: { message: firstError.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    console.error("[BILSTATUS]", "Action failed", error);
    return NextResponse.json(
      { success: false, error: { message: "Kunne ikke oppdatere bilstatus", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

/**
 * Handle toggle action
 * Logic:
 * - Cannot toggle a GREY vehicle
 * - Clicking GREEN does nothing
 * - Clicking RED: clicked becomes GREEN, other becomes RED (unless GREY)
 */
async function handleToggle(
  session: { user: { id: string; email?: string | null } },
  targetVehicle: { vehicleId: string; status: string; note: string | null; updatedAt: Date },
  otherVehicle: { vehicleId: string; status: string; note: string | null; updatedAt: Date },
  allVehicles: { vehicleId: string; status: string; note: string | null; updatedAt: Date }[]
) {
  // Cannot toggle a GREY (out of service) vehicle
  if (targetVehicle.status === "OUT_OF_SERVICE") {
    return NextResponse.json(
      { success: false, error: { message: "Kan ikke endre status på kjøretøy som er ute av drift", code: "INVALID_ACTION" } },
      { status: 400 }
    );
  }

  // If clicked vehicle is already GREEN, do nothing
  if (targetVehicle.status === "READY") {
    return NextResponse.json({
      success: true,
      data: formatVehicleStatus(allVehicles),
    });
  }

  // Toggle: clicked becomes GREEN, other becomes RED (unless GREY)
  await runWithAuditContext(
    { id: session.user.id, email: session.user.email ?? "unknown" },
    async () => {
      await prisma.vehicleStatus.update({
        where: { vehicleId: targetVehicle.vehicleId },
        data: {
          status: "READY",
          updatedBy: session.user.id,
        },
      });

      if (otherVehicle.status !== "OUT_OF_SERVICE") {
        await prisma.vehicleStatus.update({
          where: { vehicleId: otherVehicle.vehicleId },
          data: {
            status: "OUT",
            updatedBy: session.user.id,
          },
        });
      }
    }
  );

  return broadcastAndRespond(session.user.id, "Toggle", targetVehicle.vehicleId);
}

/**
 * Handle set_grey action
 * - Sets vehicle to OUT_OF_SERVICE with note
 * - Other vehicle ALWAYS becomes GREEN
 * - Cannot set grey if other vehicle is already grey
 */
async function handleSetGrey(
  session: { user: { id: string; email?: string | null } },
  targetVehicle: { vehicleId: string; status: string },
  otherVehicle: { vehicleId: string; status: string },
  note: string
) {
  // Already grey? Just update note
  if (targetVehicle.status === "OUT_OF_SERVICE") {
    await runWithAuditContext(
      { id: session.user.id, email: session.user.email ?? "unknown" },
      async () => {
        await prisma.vehicleStatus.update({
          where: { vehicleId: targetVehicle.vehicleId },
          data: {
            note,
            updatedBy: session.user.id,
          },
        });
      }
    );
    return broadcastAndRespond(session.user.id, "Update grey note", targetVehicle.vehicleId);
  }

  // Cannot set grey if other vehicle is already grey
  if (otherVehicle.status === "OUT_OF_SERVICE") {
    return NextResponse.json(
      { success: false, error: { message: "Kan ikke sette ute av drift når den andre bilen allerede er ute av drift", code: "INVALID_ACTION" } },
      { status: 400 }
    );
  }

  // Set grey - other vehicle ALWAYS becomes GREEN
  await runWithAuditContext(
    { id: session.user.id, email: session.user.email ?? "unknown" },
    async () => {
      await prisma.vehicleStatus.update({
        where: { vehicleId: targetVehicle.vehicleId },
        data: {
          status: "OUT_OF_SERVICE",
          note,
          updatedBy: session.user.id,
        },
      });

      // Other vehicle becomes GREEN
      await prisma.vehicleStatus.update({
        where: { vehicleId: otherVehicle.vehicleId },
        data: {
          status: "READY",
          updatedBy: session.user.id,
        },
      });
    }
  );

  return broadcastAndRespond(session.user.id, "Set grey", targetVehicle.vehicleId);
}

/**
 * Handle clear_grey action
 * - Restores vehicle from OUT_OF_SERVICE to RED (always)
 * - Clears the note
 */
async function handleClearGrey(
  session: { user: { id: string; email?: string | null } },
  targetVehicle: { vehicleId: string; status: string }
) {
  // Not grey?
  if (targetVehicle.status !== "OUT_OF_SERVICE") {
    return NextResponse.json(
      { success: false, error: { message: "Kjøretøyet er ikke ute av drift", code: "INVALID_ACTION" } },
      { status: 400 }
    );
  }

  // Cleared grey vehicle ALWAYS becomes RED
  await runWithAuditContext(
    { id: session.user.id, email: session.user.email ?? "unknown" },
    async () => {
      await prisma.vehicleStatus.update({
        where: { vehicleId: targetVehicle.vehicleId },
        data: {
          status: "OUT",
          note: null,
          updatedBy: session.user.id,
        },
      });
    }
  );

  return broadcastAndRespond(session.user.id, "Clear grey", targetVehicle.vehicleId);
}

/**
 * Helper to fetch updated status, broadcast SSE, and return response
 */
async function broadcastAndRespond(userId: string, action: string, vehicleId: string) {
  const updatedVehicles = await prisma.vehicleStatus.findMany({
    where: { vehicleId: { in: [...VEHICLES] } },
  });

  const responseData = formatVehicleStatus(updatedVehicles);
  broadcastSSE("bilstatus_update", responseData);

  console.info("[BILSTATUS]", action, {
    vehicle: vehicleId,
    updatedBy: userId,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, data: responseData });
}
