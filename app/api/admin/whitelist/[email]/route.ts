import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE - Remove user from whitelist (soft delete - sets whitelisted to false)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMINISTRATOR") {
    return Response.json({
      success: false,
      error: { message: "Ingen tilgang", code: "FORBIDDEN" }
    }, { status: 403 });
  }

  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);

  // Prevent removing yourself from whitelist
  if (decodedEmail === session.user.email) {
    return Response.json({
      success: false,
      error: { message: "Du kan ikke fjerne deg selv fra whitelist", code: "SELF_REMOVAL" }
    }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { email: decodedEmail },
      data: { whitelisted: false },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({
      success: false,
      error: { message: "Bruker ikke funnet", code: "NOT_FOUND" }
    }, { status: 404 });
  }
}

// PATCH - Update user role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMINISTRATOR") {
    return Response.json({
      success: false,
      error: { message: "Ingen tilgang", code: "FORBIDDEN" }
    }, { status: 403 });
  }

  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);
  const body = await request.json();

  // Prevent changing your own role
  if (decodedEmail === session.user.email && body.role) {
    return Response.json({
      success: false,
      error: { message: "Du kan ikke endre din egen rolle", code: "SELF_MODIFY" }
    }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email: decodedEmail },
      data: {
        ...(body.role && { role: body.role }),
        ...(typeof body.whitelisted === "boolean" && { whitelisted: body.whitelisted }),
      },
    });

    return Response.json({ success: true, data: user });
  } catch {
    return Response.json({
      success: false,
      error: { message: "Bruker ikke funnet", code: "NOT_FOUND" }
    }, { status: 404 });
  }
}
