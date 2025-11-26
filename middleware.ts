import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes - no auth required
  const publicRoutes = ["/login", "/access-denied"];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If logged in and trying to access login, redirect to app
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/hva-skjer", req.url));
    }
    return NextResponse.next();
  }

  // Auth API routes are handled by NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
