import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OPERATOR", "ADMINISTRATOR"]).default("OPERATOR"),
});

// GET - List all users (whitelisted and non-whitelisted)
export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "ADMINISTRATOR") {
    return Response.json({
      success: false,
      error: { message: "Ingen tilgang", code: "FORBIDDEN" }
    }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      whitelisted: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  return Response.json({ success: true, data: users });
}

// POST - Add user to whitelist or update existing user
export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMINISTRATOR") {
    return Response.json({
      success: false,
      error: { message: "Ingen tilgang", code: "FORBIDDEN" }
    }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validated = addUserSchema.parse(body);

    const user = await prisma.user.upsert({
      where: { email: validated.email },
      create: {
        email: validated.email,
        name: validated.email.split("@")[0],
        role: validated.role,
        whitelisted: true,
      },
      update: {
        role: validated.role,
        whitelisted: true,
      },
    });

    return Response.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        error: { message: "Ugyldig data", code: "VALIDATION_ERROR", details: error.errors }
      }, { status: 400 });
    }
    throw error;
  }
}
