# Technical Specification - Epic 2: Authentication & Access Control

**Project:** ibe160 - Hva Skjer
**Epic:** 2 - Authentication & Access Control
**Author:** BIP (AI-generated)
**Date:** 2025-11-23
**Version:** 1.0

---

## Executive Summary

Epic 2 implements Google OAuth authentication with NextAuth.js v5, whitelist-based access control, and role-based permissions (Operator/Administrator). This epic secures the entire Hva Skjer application and enables all subsequent feature development.

**Critical Dependency:** All features in Epics 3, 4, and 5 depend on this authentication infrastructure.

---

## NextAuth.js v5 (Auth.js) Key Patterns

**IMPORTANT:** NextAuth v5 has significant breaking changes from v4. Follow these patterns exactly.

### Version Information

| Package | Current Version | Latest Stable |
|---------|-----------------|---------------|
| next-auth | 5.0.0-beta.30 | 5.0.0-beta.30 |
| @auth/prisma-adapter | ^2.0.0 | ^2.0.0 |

### Environment Variables (Auto-Detected)

NextAuth v5 uses `AUTH_` prefix (NOT `NEXTAUTH_` for providers):

```bash
# Core Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (auto-detected by Auth.js)
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-client-secret"

# URL (still uses NEXTAUTH_ prefix)
NEXTAUTH_URL="http://localhost:3000"  # Development
# NEXTAUTH_URL="https://hva-skjer.vercel.app"  # Production
```

### File Structure

```
src/
├── auth.ts                    # Main Auth.js config (root of src or project root)
├── auth.config.ts             # Edge-compatible config (no Prisma)
├── middleware.ts              # Route protection
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts   # Minimal - just exports handlers
```

### Configuration Pattern (auth.ts)

```typescript
// src/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 16 * 60 * 60, // 16 hours (12-hour shift + buffer)
  },
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Whitelist check
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      if (!dbUser?.whitelisted) {
        return "/access-denied"
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        token.id = dbUser?.id
        token.role = dbUser?.role ?? "operator"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
```

### API Route (Minimal)

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

### Session Access Pattern

```typescript
// Server Components
import { auth } from "@/auth"

export default async function Page() {
  const session = await auth()
  if (!session) redirect("/login")

  return <div>Welcome {session.user.name}</div>
}

// API Routes
import { auth } from "@/auth"

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ...
}

// Client Components - use SessionProvider
import { SessionProvider } from "next-auth/react"
import { useSession } from "next-auth/react"
```

### Middleware Pattern

```typescript
// src/middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes
  if (pathname === "/login" || pathname === "/access-denied") {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## Epic 2 Stories Overview

| Story | Title | Dependencies |
|-------|-------|--------------|
| 2.1 | NextAuth.js Configuration with Google OAuth | Epic 1 complete |
| 2.2 | User Whitelist Management System | Story 2.1 |
| 2.3 | Role-Based Access Control (RBAC) Implementation | Story 2.2 |
| 2.4 | Protected Routes and API Endpoints | Story 2.1 |
| 2.5 | Login Page and User Profile UI | Story 2.1, Story 1.3 |
| 2.6 | Session Management and Security Hardening | Story 2.1 |

---

## Story 2.1: NextAuth.js Configuration with Google OAuth

### Objective

Configure NextAuth.js v5 with Google OAuth provider, establishing the authentication foundation.

### Acceptance Criteria

1. Google OAuth 2.0 is configured as authentication provider
2. OAuth consent screen is properly configured in Google Cloud Console
3. Callback URLs are whitelisted for development and production
4. NextAuth.js routes are protected with middleware
5. Session configuration uses JWT with 16-hour expiration

### Implementation Steps

#### Step 1: Install Dependencies

```bash
npm install next-auth@beta @auth/prisma-adapter
```

#### Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to "APIs & Services" → "Credentials"
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://hva-skjer.vercel.app` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://hva-skjer.vercel.app/api/auth/callback/google`
5. Copy Client ID and Client Secret

#### Step 3: Set Environment Variables

```bash
# .env.local
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-client-secret"
NEXTAUTH_URL="http://localhost:3000"
```

#### Step 4: Create Auth Configuration

Create `src/auth.ts`:

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 16 * 60 * 60, // 16 hours
  },
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
})
```

#### Step 5: Create API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

#### Step 6: Extend Types

Create `src/types/next-auth.d.ts`:

```typescript
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}
```

### Files to Create/Modify

- `src/auth.ts` - Main auth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - API route handlers
- `src/types/next-auth.d.ts` - Type extensions
- `.env.local` - Environment variables

---

## Story 2.2: User Whitelist Management System

### Objective

Implement whitelist-based access control where only pre-approved email addresses can access the operator system.

### Acceptance Criteria

1. System checks if user's email is in the whitelist on login
2. Whitelisted users are granted access
3. Non-whitelisted users see "Access Denied" message
4. Administrators can add/remove emails from whitelist via UI

### Implementation Steps

#### Step 1: Update Auth Callbacks

Update `src/auth.ts` to include whitelist check:

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    if (!user.email) return false

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    // If user doesn't exist or not whitelisted, deny access
    if (!dbUser || !dbUser.whitelisted) {
      return "/access-denied"
    }

    return true
  },
  // ... other callbacks
}
```

#### Step 2: Create Access Denied Page

Create `src/app/access-denied/page.tsx`:

```typescript
export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Ingen tilgang
        </h1>
        <p className="text-gray-300 mb-6">
          Du har ikke tilgang til denne applikasjonen.
          Kontakt administrator for å få tilgang.
        </p>
        <p className="text-sm text-gray-400">
          Kontakt: admin@example.com
        </p>
      </div>
    </div>
  )
}
```

#### Step 3: Create Whitelist API

Create `src/app/api/admin/whitelist/route.ts`:

```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["operator", "admin"]).default("operator"),
})

// GET - List all whitelisted users
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    return Response.json({
      success: false,
      error: { message: "Ingen tilgang", code: "FORBIDDEN" }
    }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    where: { whitelisted: true },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  })

  return Response.json({ success: true, data: users })
}

// POST - Add user to whitelist
export async function POST(request: Request) {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    return Response.json({
      success: false,
      error: { message: "Ingen tilgang", code: "FORBIDDEN" }
    }, { status: 403 })
  }

  const body = await request.json()
  const validated = addUserSchema.parse(body)

  const user = await prisma.user.upsert({
    where: { email: validated.email },
    create: {
      email: validated.email,
      role: validated.role,
      whitelisted: true,
    },
    update: {
      role: validated.role,
      whitelisted: true,
    },
  })

  return Response.json({ success: true, data: user }, { status: 201 })
}
```

Create `src/app/api/admin/whitelist/[email]/route.ts`:

```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// DELETE - Remove user from whitelist
export async function DELETE(
  request: Request,
  { params }: { params: { email: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    return Response.json({
      success: false,
      error: { message: "Ingen tilgang", code: "FORBIDDEN" }
    }, { status: 403 })
  }

  const email = decodeURIComponent(params.email)

  await prisma.user.update({
    where: { email },
    data: { whitelisted: false },
  })

  return Response.json({ success: true })
}
```

### Files to Create/Modify

- `src/auth.ts` - Add whitelist check to signIn callback
- `src/app/access-denied/page.tsx` - Access denied page
- `src/app/api/admin/whitelist/route.ts` - List/add users
- `src/app/api/admin/whitelist/[email]/route.ts` - Remove users

---

## Story 2.3: Role-Based Access Control (RBAC) Implementation

### Objective

Assign roles (Operator or Administrator) to users with server-side permission enforcement.

### Acceptance Criteria

1. Role is stored in User table and included in JWT session
2. Operator role: view, create, edit content, toggle bilstatus
3. Administrator role: all operator permissions + delete, manage users, view audit logs
4. API endpoints enforce role-based permissions server-side

### Implementation Steps

#### Step 1: Create Authorization Helper

Create `src/lib/authorize.ts`:

```typescript
import { Session } from "next-auth"

type Role = "operator" | "admin"
type Resource = "flash" | "event" | "bilstatus" | "vaktplan" | "bonfire" | "audit" | "users"
type Action = "create" | "read" | "update" | "delete"

const permissions: Record<Role, Record<Resource, Action[]>> = {
  operator: {
    flash: ["create", "read", "delete"],
    event: ["create", "read", "update", "delete"],
    bilstatus: ["read", "update"],
    vaktplan: ["read", "update", "delete"],
    bonfire: ["create", "read", "update"],
    audit: [],
    users: [],
  },
  admin: {
    flash: ["create", "read", "delete"],
    event: ["create", "read", "update", "delete"],
    bilstatus: ["read", "update"],
    vaktplan: ["create", "read", "update", "delete"],
    bonfire: ["create", "read", "update", "delete"],
    audit: ["read"],
    users: ["create", "read", "update", "delete"],
  },
}

export function authorize(
  session: Session | null,
  resource: Resource,
  action: Action
): boolean {
  if (!session?.user?.role) return false

  const role = session.user.role as Role
  const allowedActions = permissions[role]?.[resource] ?? []

  return allowedActions.includes(action)
}

export function requireRole(session: Session | null, roles: Role[]): boolean {
  if (!session?.user?.role) return false
  return roles.includes(session.user.role as Role)
}
```

#### Step 2: Update JWT Callback

Ensure `src/auth.ts` includes role in JWT:

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })
      token.id = dbUser?.id
      token.role = dbUser?.role ?? "operator"
    }
    return token
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string
      session.user.role = token.role as string
    }
    return session
  },
}
```

#### Step 3: Usage in API Routes

```typescript
import { auth } from "@/auth"
import { authorize } from "@/lib/authorize"

export async function DELETE(request: Request) {
  const session = await auth()

  if (!authorize(session, "bonfire", "delete")) {
    return Response.json({
      success: false,
      error: { message: "Ingen tilgang", code: "FORBIDDEN" }
    }, { status: 403 })
  }

  // Proceed with deletion...
}
```

### Files to Create/Modify

- `src/lib/authorize.ts` - Authorization helper functions
- `src/auth.ts` - Update JWT and session callbacks

---

## Story 2.4: Protected Routes and API Endpoints

### Objective

Protect all application routes and API endpoints so only authenticated users can access the system.

### Acceptance Criteria

1. Unauthenticated users are redirected to login page
2. After authentication, users are redirected to intended destination
3. All API endpoints require valid session
4. Invalid/expired sessions return 401 Unauthorized

### Implementation Steps

#### Step 1: Create Middleware

Create `src/middleware.ts`:

```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes - no auth required
  const publicRoutes = ["/login", "/access-denied"]
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Auth API routes are handled by NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
}
```

#### Step 2: Create API Auth Helper

Create `src/lib/api-auth.ts`:

```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function requireAuth() {
  const session = await auth()

  if (!session) {
    return {
      authorized: false,
      response: Response.json({
        success: false,
        error: { message: "Ikke autentisert", code: "UNAUTHORIZED" }
      }, { status: 401 }),
    }
  }

  return { authorized: true, session }
}

// Usage example:
// const authResult = await requireAuth()
// if (!authResult.authorized) return authResult.response
// const { session } = authResult
```

### Files to Create/Modify

- `src/middleware.ts` - Route protection middleware
- `src/lib/api-auth.ts` - API authentication helper

---

## Story 2.5: Login Page and User Profile UI

### Objective

Create professional login page and user profile display matching emergency services aesthetic.

### Acceptance Criteria

1. Professional login page with "Sign in with Google" button
2. After authorization, user is redirected to application
3. User info (name, email, role) displayed in UI header
4. Logout button is clearly visible

### Implementation Steps

#### Step 1: Create Login Page

Create `src/app/login/page.tsx`:

```typescript
import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect("/hva-skjer")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Hva Skjer</CardTitle>
          <CardDescription className="text-gray-400">
            110 Sør-Vest - Nødvarslingssentral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/hva-skjer" })
            }}
          >
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Logg inn med Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### Step 2: Create User Profile Component

Create `src/components/layout/UserProfile.tsx`:

```typescript
"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserProfile() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white">
          {session.user?.name || session.user?.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
        <DropdownMenuLabel className="text-gray-300">
          {session.user?.email}
        </DropdownMenuLabel>
        <DropdownMenuLabel className="text-xs text-gray-500">
          Rolle: {session.user?.role === "admin" ? "Administrator" : "Operatør"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem
          className="text-gray-300 cursor-pointer hover:bg-gray-700"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Logg ut
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

#### Step 3: Create Session Provider Wrapper

Create `src/components/providers/SessionProvider.tsx`:

```typescript
"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

#### Step 4: Update Root Layout

Update `src/app/layout.tsx` to include SessionProvider:

```typescript
import { SessionProvider } from "@/components/providers/SessionProvider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### Files to Create/Modify

- `src/app/login/page.tsx` - Login page
- `src/components/layout/UserProfile.tsx` - User profile dropdown
- `src/components/providers/SessionProvider.tsx` - Session provider wrapper
- `src/app/layout.tsx` - Add SessionProvider

---

## Story 2.6: Session Management and Security Hardening

### Objective

Secure sessions with proper expiration, token verification, and security headers.

### Acceptance Criteria

1. JWT tokens verified on every request
2. Sessions expire after 16 hours of inactivity
3. Expired sessions automatically cleared
4. Security headers configured (CSP, HSTS, etc.)
5. Token refresh happens automatically before expiration

### Implementation Steps

#### Step 1: Configure Security Headers

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile images
      },
    ],
  },
}

module.exports = nextConfig
```

#### Step 2: Configure Session Settings in auth.ts

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ... other config
  session: {
    strategy: "jwt",
    maxAge: 16 * 60 * 60, // 16 hours
    updateAge: 2 * 60 * 60, // Refresh token every 2 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
})
```

### Files to Create/Modify

- `next.config.js` - Security headers
- `src/auth.ts` - Session and cookie configuration

---

## Database Schema Reference

The User model (from Epic 1) already includes:

```prisma
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("operator") // "operator" | "admin"
  whitelisted   Boolean   @default(false)

  accounts      Account[]
  sessions      Session[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
}
```

---

## Testing Checklist

### Story 2.1: NextAuth.js Configuration
- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes without errors
- [ ] Google OAuth redirects correctly
- [ ] Session is created after successful login

### Story 2.2: Whitelist Management
- [ ] Non-whitelisted users see "Access Denied" page
- [ ] Whitelisted users can access application
- [ ] Admin can add/remove users from whitelist

### Story 2.3: RBAC Implementation
- [ ] Operators cannot access admin endpoints
- [ ] Administrators have full access
- [ ] Role is included in session

### Story 2.4: Protected Routes
- [ ] Unauthenticated users redirected to /login
- [ ] API routes return 401 for unauthenticated requests
- [ ] Callback URL preserved after login

### Story 2.5: Login Page
- [ ] Login page renders correctly
- [ ] Google sign-in button works
- [ ] User profile shows name and role
- [ ] Logout works correctly

### Story 2.6: Security Hardening
- [ ] Security headers present in response
- [ ] Session expires after 16 hours
- [ ] Cookies are httpOnly and secure

---

## Dependencies from Epic 1

Epic 2 depends on these Epic 1 deliverables:

| Dependency | Source |
|------------|--------|
| User model in Prisma schema | Story 1.2 |
| Account, Session models | Story 1.2 |
| Audit logging infrastructure | Story 1.8 |
| UI framework (shadcn/ui) | Story 1.3 |
| Deployment pipeline | Story 1.6 |

---

## References

- [Auth.js Documentation](https://authjs.dev/)
- [Auth.js Migration Guide (v4 to v5)](https://authjs.dev/getting-started/migrating-to-v5)
- [NextAuth.js GitHub Releases](https://github.com/nextauthjs/next-auth/releases)
- [Google OAuth Setup](https://console.cloud.google.com/apis/credentials)
- [PRD FR6: Authentication & Access Control](./prd.md#fr6-authentication--access-control)
- [Architecture: Security](./architecture.md#security-architecture)

---

_Generated by epic-tech-context workflow v1.0_
_Date: 2025-11-23_
_For: BIP_
