import { auth } from "@/lib/auth";
import { Session } from "next-auth";

type AuthResult =
  | { authorized: false; response: Response }
  | { authorized: true; session: Session };

export async function requireAuth(): Promise<AuthResult> {
  const session = await auth();

  if (!session) {
    return {
      authorized: false,
      response: Response.json({
        success: false,
        error: { message: "Ikke autentisert", code: "UNAUTHORIZED" }
      }, { status: 401 }),
    };
  }

  return { authorized: true, session };
}

export async function requireAdmin(): Promise<AuthResult> {
  const session = await auth();

  if (!session) {
    return {
      authorized: false,
      response: Response.json({
        success: false,
        error: { message: "Ikke autentisert", code: "UNAUTHORIZED" }
      }, { status: 401 }),
    };
  }

  if (session.user.role !== "ADMINISTRATOR") {
    return {
      authorized: false,
      response: Response.json({
        success: false,
        error: { message: "Ingen tilgang", code: "FORBIDDEN" }
      }, { status: 403 }),
    };
  }

  return { authorized: true, session };
}
