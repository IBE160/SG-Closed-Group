# Architecture - Hva Skjer Emergency Response Application

**Project:** ibe160 - Hva Skjer
**Author:** BIP
**Date:** 2025-11-13
**Version:** 1.0

---

## Executive Summary

The Hva Skjer architecture is built on Next.js 14 with App Router, designed for 24/7 emergency response operations supporting 4-6 concurrent dispatchers. The system prioritizes sub-second real-time communication, zero-downtime reliability, and emergency-first UX design. All architectural decisions optimize for speed during high-pressure situations where seconds directly impact safety outcomes.

**Core Design Principles:**
- Real-time synchronization via Server-Sent Events (< 1 second latency)
- Always-visible flash message bar (no tab switching required)
- Automated vehicle rotation with mutual exclusivity enforcement
- Two-phase AI automation with duplicate detection
- Government-grade security compliance (GDPR, audit trails)

---

## Project Initialization

**First implementation story should execute:**

```bash
npx create-next-app@latest hva-skjer --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**This establishes the base architecture with:**
- ✅ Next.js 14 with App Router - Modern routing architecture
- ✅ TypeScript - Type safety for all code
- ✅ Tailwind CSS - Utility-first styling (pre-configured)
- ✅ ESLint - Code quality and consistency
- ✅ src/ directory structure - Organized code layout
- ✅ @/* import alias - Clean import paths

**Additional setup required after starter:**
```bash
# Prisma ORM
npm install prisma @prisma/client
npx prisma init

# NextAuth.js v5
npm install next-auth@beta @auth/prisma-adapter

# Zustand state management
npm install zustand

# shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog tabs

# Google Maps
npm install @googlemaps/js-api-loader @googlemaps/markerclusterer

# Azure OpenAI
npm install @azure/openai

# Utilities
npm install zod react-hook-form @hookform/resolvers
npm install date-fns
npm install react-hot-toast

# Testing
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
```

---

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| **Runtime** | Node.js | 22.x or 24.x LTS | All | Active LTS support through 2027-2028 |
| **Framework** | Next.js | 14.x (App Router) | All | Modern routing, server components, Vercel optimization |
| **Language** | TypeScript | Latest | All | Type safety, better DX, catch errors at compile time |
| **Database** | PostgreSQL via Vercel Postgres | Latest | Epic 1-4 | Seamless Vercel integration, sufficient free tier |
| **Database (Bonfire)** | Azure Table Storage | Latest | Epic 5 | GDPR-compliant NoSQL, student Azure access, parallel development |
| **ORM** | Prisma | 6.x | Epic 1-4 | Type-safe queries, migrations, great Next.js integration |
| **Auth** | NextAuth.js v5 (Auth.js) | 5.0.0-beta | Epic 2 | Google OAuth, JWT sessions, Prisma adapter, edge-compatible |
| **UI Framework** | Tailwind CSS | 3.x | All | Utility-first, fast development, provided by starter |
| **Component Library** | shadcn/ui | Latest | All | Accessible, customizable, Tailwind-based |
| **State Management** | Zustand | Latest | All | Lightweight (1KB), better performance than Context API |
| **Real-time** | Server-Sent Events (SSE) | Native | Epic 4 | Free, perfect for one-way broadcasts, < 1s latency |
| **Error Handling** | Toast notifications | react-hot-toast | All | Non-blocking, visible but not intrusive for emergencies |
| **Logging** | Vercel Logs + console | Native | All | Free, zero setup, sufficient for 4-6 users |
| **Testing** | Vitest + Playwright | Latest | All | Fast modern tooling, focus on critical paths |
| **Maps** | Google Maps JavaScript API | Latest | Epic 5 | Places, Geocoding, Maps display, marker clustering |
| **AI** | Azure OpenAI GPT-4o | Latest | Epic 5 | Government-compliant (FedRAMP High), structured extraction |
| **Automation** | Power Automate | N/A | Epic 5 | Email monitoring, 29 municipal folders |
| **Deployment** | Vercel | N/A | All | Continuous deployment, edge functions, automatic HTTPS |

---

## Technology Stack Details

### Core Stack

**Frontend:**
- React 19 (bundled with Next.js 14)
- Next.js 14 App Router
- TypeScript 5.x
- Tailwind CSS 3.x
- shadcn/ui components (Radix UI primitives)

**Backend:**
- Next.js API Routes (App Router)
- Prisma ORM 6.x
- PostgreSQL (Vercel Postgres)
- Server-Sent Events for real-time

**Authentication:**
- NextAuth.js v5 (Auth.js)
- Google OAuth 2.0 provider
- JWT sessions (16-hour expiration)
- Prisma adapter for user storage

**State Management:**
- Zustand (client state)
- React Server Components (server state)
- SWR pattern for data fetching

**External Services:**
- Google Maps JavaScript API
  - Places API (Autocomplete)
  - Geocoding API
  - Maps JavaScript API
  - @googlemaps/markerclusterer
- Azure OpenAI Service
  - GPT-4o model
  - Government-compliant endpoint
- Power Automate
  - Shared mailbox monitoring
  - 29 municipal folders

### Integration Points

**Real-Time Communication:**
```
Dispatcher Action →
API Route Handler →
Database Update (Prisma) →
SSE Broadcast →
All Connected Dispatchers (< 1 second)
```

**Authentication Flow:**
```
User clicks "Sign in with Google" →
Google OAuth consent →
NextAuth.js receives token →
Check email in User whitelist (Prisma) →
Create JWT session (16 hours) →
Redirect to /hva-skjer dashboard
```

**Bonfire Automation (Phase 2):**
```
Email arrives in municipal folder →
Power Automate trigger →
Extract email body + metadata →
POST /api/bonfires/extract (Azure OpenAI) →
Validation check →
Duplicate detection →
Auto-create POI or flag for review
```

---

## Project Structure

```
hva-skjer/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── access-denied/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Protected route group
│   │   │   ├── layout.tsx            # Dashboard layout with tabs + flash bar
│   │   │   ├── hva-skjer/            # Default landing page
│   │   │   │   └── page.tsx
│   │   │   ├── flash/
│   │   │   │   └── page.tsx
│   │   │   ├── balmelding/
│   │   │   │   └── page.tsx
│   │   │   └── innstillinger/
│   │   │       └── page.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # NextAuth handlers
│   │   │   ├── sse/
│   │   │   │   └── route.ts          # Server-Sent Events
│   │   │   ├── flash/
│   │   │   │   └── route.ts
│   │   │   ├── events/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── bilstatus/
│   │   │   │   └── route.ts
│   │   │   ├── vaktplan/
│   │   │   │   └── route.ts
│   │   │   ├── bonfires/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── extract/
│   │   │   │       └── route.ts      # Azure OpenAI extraction
│   │   │   └── audit/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Root redirect to /hva-skjer
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── flash/
│   │   │   ├── FlashMessageBar.tsx         # Always-visible top bar
│   │   │   ├── FlashMessageInput.tsx
│   │   │   └── FlashMessageHistory.tsx
│   │   ├── events/
│   │   │   ├── EventList.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── EventCard.tsx
│   │   ├── bilstatus/
│   │   │   ├── VehicleStatusBox.tsx
│   │   │   └── VehicleStatusToggle.tsx
│   │   ├── vaktplan/
│   │   │   └── DutyRoster.tsx
│   │   ├── bonfires/
│   │   │   ├── BonfireMap.tsx
│   │   │   ├── BonfireMarker.tsx
│   │   │   ├── BonfireRegistrationForm.tsx
│   │   │   ├── BonfireChatbot.tsx
│   │   │   └── BonfireStatusControl.tsx
│   │   └── layout/
│   │       ├── DashboardTabs.tsx
│   │       ├── Header.tsx
│   │       └── SSEProvider.tsx
│   │
│   ├── lib/                          # Utilities and helpers
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── auth.config.ts            # Edge-compatible auth config
│   │   ├── sse.ts                    # SSE connection manager
│   │   ├── google-maps.ts            # Google Maps utilities
│   │   ├── azure-openai.ts           # Azure OpenAI client
│   │   ├── validators.ts             # Zod schemas
│   │   └── utils.ts                  # General utilities (cn, etc.)
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useTabStore.ts
│   │   ├── useFlashStore.ts
│   │   ├── useEventStore.ts
│   │   ├── useBilstatusStore.ts
│   │   └── useConnectionStore.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── models.ts
│   │
│   └── middleware.ts                 # Auth middleware
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│       └── playwright/
│
├── public/
│   ├── icons/
│   │   ├── fire-registered.svg       # Blue fire icon
│   │   ├── fire-active.svg           # Red fire icon
│   │   └── fire-finished.svg         # Green fire icon
│   └── images/
│
├── .env.local                        # Environment variables
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── vitest.config.ts
```

---

## Epic to Architecture Mapping

| Epic | Architecture Components | Database Tables | API Endpoints |
|------|------------------------|-----------------|---------------|
| **Epic 1: Foundation** | Next.js setup, Prisma, Tailwind, shadcn/ui, Tabs, SSE infrastructure | All tables initialized | All API structure |
| **Epic 2: Authentication** | NextAuth.js, Google OAuth, Middleware, Session management | User, Account, Session, VerificationToken | /api/auth/[...nextauth] |
| **Epic 3: Event Control** | EventList, EventForm, VehicleStatusBox, DutyRoster | Event, VehicleStatus, DutyRoster | /api/events, /api/bilstatus, /api/vaktplan |
| **Epic 4: Flash Messages** | FlashMessageBar, FlashInput, FlashHistory, SSE provider | FlashMessage | /api/flash, /api/sse |
| **Epic 5: Bålmelding** | BonfireMap, BonfireMarker, Chatbot, StatusControl, Azure OpenAI, Power Automate | BonfireRegistration | /api/bonfires, /api/bonfires/extract |

---

## Novel Pattern Designs

### Pattern 1: Always-Visible Flash Message Bar

**Purpose:** Ensure flash messages are visible regardless of active tab, eliminating need for tab auto-switching that would interrupt dispatcher workflow.

**Architecture:**

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  Flash Message Bar (ALWAYS VISIBLE) │ ← Top of app, persistent across all tabs
│  [Blinks when new message arrives]  │
├─────────────────────────────────────┤
│  [Hva Skjer] [Flash] [Bålmelding]  │ ← Tab navigation
├─────────────────────────────────────┤
│  Active Tab Content                 │
│  (Changes based on selected tab)    │
└─────────────────────────────────────┘
```

**Implementation:**

```typescript
// Dashboard layout (src/app/(dashboard)/layout.tsx)
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Always visible at top */}
      <FlashMessageBar />

      {/* Tab navigation */}
      <DashboardTabs />

      {/* Active tab content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

// FlashMessageBar component
export function FlashMessageBar() {
  const { latestMessage, markAsRead } = useFlashStore();
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (latestMessage?.unread) {
      // 3 quick blinks, then continuous
      triggerBlinkAnimation();
    }
  }, [latestMessage]);

  return (
    <div
      className={cn(
        "w-full bg-emergency-red text-white p-4",
        isBlinking && "animate-blink"
      )}
      onClick={() => {
        setIsBlinking(false);
        markAsRead(latestMessage.id);
      }}
    >
      {latestMessage?.text || "Ingen nye meldinger"}
    </div>
  );
}
```

**SSE Handler:**
```typescript
// When flash message received via SSE
sseClient.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "flash_message") {
    // Update Zustand store
    useFlashStore.setState({
      latestMessage: {
        id: data.id,
        text: data.message,
        timestamp: data.timestamp,
        unread: true
      }
    });

    // Flash bar automatically blinks via useEffect
    // NO tab switching needed!
  }
};
```

**Benefits:**
- ✅ No workflow interruption
- ✅ Always visible in any tab
- ✅ Simpler implementation
- ✅ Better for emergency operations

**"Flash" Tab Purpose:**
- View flash message history (last 24 hours)
- Scroll through older messages
- Not primary notification method

---

### Pattern 2: Automatic Vehicle Rotation with Mutual Exclusivity

**Purpose:** Ensure fair workload distribution between S111 and S112 fire trucks with automatic enforcement of business rules.

**Business Rules:**

1. **Mutual Exclusivity:** Only ONE truck can be green (ready) at a time
2. **Automatic Pairing:** Click one truck → paired truck updates automatically
3. **Grey Status Lock:** Grey boxes cannot be toggled with left-click
4. **Safety Guarantee:** If one truck grey → other MUST be green
5. **Comment Persistence:** Comments persist across status changes
6. **Grey Clearing:** Clearing grey returns to RED (not green)

**State Machine:**

```
Valid States:
✅ S111: Green  | S112: Red
✅ S111: Red    | S112: Green
✅ S111: Grey   | S112: Green (forced)
✅ S111: Green  | S112: Grey (forced)

Invalid States (prevented by system):
❌ S111: Green  | S112: Green
❌ S111: Red    | S112: Red
❌ S111: Grey   | S112: Grey
```

**Visual Design:**

```
┌─────────────────┐  ┌─────────────────┐
│      S111       │  │      S112       │
│   [GREEN BOX]   │  │   [RED BOX]     │
│                 │  │                 │
│ "Mangler brann- │  │ "Klar for      │
│  slange"        │  │  utrykning"    │
└─────────────────┘  └─────────────────┘
```

**Data Model:**

```typescript
model VehicleStatus {
  id        String   @id @default(uuid())
  vehicle   String   @unique // "S111" or "S112"
  status    String   // "green", "red", "grey"
  comment   String?  // Optional note for any status
  greyNote  String?  // Required note when grey (kept separate)
  updatedAt DateTime @updatedAt
  updatedBy String   // User ID

  @@index([vehicle, status])
}
```

**Interaction Patterns:**

**1. Left-Click Toggle (Normal Operation):**
```typescript
// S111 is red, S112 is green, neither grey
async function handleBoxClick(vehicle: "S111" | "S112") {
  const status = await getStatus(vehicle);
  const pairedStatus = await getStatus(paired);

  // Block if clicked box is grey
  if (status === "grey") {
    toast.error("Kjøretøy er ute av drift - høyreklikk for å endre");
    return;
  }

  // Block if paired box is grey
  if (pairedStatus === "grey") {
    toast.error(`${paired} er ute av drift`);
    return;
  }

  // Safe to toggle
  await updateBilstatus({
    [vehicle]: status === "green" ? "red" : "green",
    [paired]: pairedStatus === "green" ? "red" : "green"
  });
}
```

**2. Right-Click Menu:**
```typescript
Menu Options:
- "Legg til/rediger kommentar" → Opens dialog, saves comment, preserves status
- "Sett ute av drift" → Opens dialog, requires note, sets grey + paired to green
- "Fjern kommentar" → Deletes comment only
- "Fjern ute av drift" → Clears grey → returns to RED
```

**3. Grey Status Management:**
```typescript
async function setOutOfService(vehicle: string, note: string, userId: string) {
  await prisma.$transaction([
    // Set vehicle to grey
    prisma.vehicleStatus.update({
      where: { vehicle },
      data: {
        status: "grey",
        greyNote: note,
        updatedBy: userId,
        updatedAt: new Date()
      }
    }),

    // Force paired to green (safety guarantee)
    prisma.vehicleStatus.update({
      where: { vehicle: paired },
      data: {
        status: "green",
        updatedBy: userId,
        updatedAt: new Date()
      }
    })
  ]);

  // Broadcast via SSE
  broadcastSSE({ type: "bilstatus_update", data: { ... } });
}

async function clearOutOfService(vehicle: string, userId: string) {
  await prisma.vehicleStatus.update({
    where: { vehicle },
    data: {
      status: "red",  // Explicitly RED, not green
      greyNote: null, // Clear grey note
      updatedBy: userId,
      updatedAt: new Date()
      // comment preserved!
    }
  });

  broadcastSSE({ type: "bilstatus_update", data: { ... } });
}
```

**Real-Time Sync:**
- All dispatchers see changes < 1 second
- SSE event: `{ type: "bilstatus_update", data: { S111: {...}, S112: {...} } }`
- Both boxes update simultaneously

**API Endpoint:**

```typescript
// PATCH /api/bilstatus
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return unauthorized();

  const { vehicle, action, note } = await request.json();

  switch (action) {
    case "toggle":
      return handleToggle(vehicle, session.user.id);
    case "set_grey":
      return handleSetGrey(vehicle, note, session.user.id);
    case "clear_grey":
      return handleClearGrey(vehicle, session.user.id);
    case "update_comment":
      return handleUpdateComment(vehicle, note, session.user.id);
    case "delete_comment":
      return handleDeleteComment(vehicle, session.user.id);
  }
}
```

---

### Pattern 3: Parallel AI Automation with Duplicate Detection

**Purpose:** Run manual and automated bonfire registration simultaneously, preventing duplicates while building confidence in AI accuracy.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Email Arrives                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   AUTOMATED PATH        MANUAL PATH
   (Phase 2)            (Phase 1)
        │                     │
Power Automate          Dispatcher copies
monitors email          & pastes to chatbot
        │                     │
        ▼                     ▼
Azure OpenAI            Azure OpenAI
extraction              extraction
        │                     │
        ▼                     ▼
Validation check        Manual review
        │                     │
   ✅ Valid?                 ▼
        │              Approve & Submit
        ├─YES──────┐          │
        │          │          │
        ▼          ▼          ▼
    Create POI ◄───┴──────────┘
        │
        ▼
┌───────────────────────────────────┐
│   DUPLICATE CHECK                 │
│   (Before final save)             │
│                                   │
│   Match: address + dateFrom       │
│   within ±1 hour window           │
│                                   │
│   ✅ Duplicate → Skip/Log         │
│   ❌ New → Save POI               │
└───────────────────────────────────┘
```

**Data Model:**

```typescript
model BonfireRegistration {
  id           String   @id @default(uuid())
  source       String   // "automated" | "manual_chatbot"
  status       String   // "REGISTERED" | "ACTIVE" | "FINISHED" | "REMOVED"

  // Citizen data
  name         String
  phone        String
  address      String
  lat          Float
  lng          Float
  municipality String
  bonfireSize  String?
  dateFrom     DateTime
  dateTo       DateTime
  notes        String?

  // Validation tracking
  validated    Boolean  @default(false)

  // Status management
  statusUpdatedAt    DateTime  @default(now())
  statusUpdatedBy    String?   // User ID if manually changed
  autoStatusDisabled Boolean   @default(false)

  // Metadata
  createdAt    DateTime @default(now())
  createdBy    String?  // User ID for manual entries

  @@index([status, dateFrom])
  @@index([address, dateFrom]) // Duplicate detection
  @@index([municipality, status])
}
```

**Duplicate Detection:**

```typescript
async function checkDuplicate(newBonfire: BonfireInput) {
  const oneHour = 60 * 60 * 1000;

  const existing = await prisma.bonfireRegistration.findFirst({
    where: {
      address: {
        equals: newBonfire.address,
        mode: 'insensitive'
      },
      dateFrom: {
        gte: new Date(newBonfire.dateFrom.getTime() - oneHour),
        lte: new Date(newBonfire.dateFrom.getTime() + oneHour)
      },
      status: {
        not: "REMOVED"
      }
    }
  });

  if (existing) {
    // Log duplicate for monitoring
    console.info('[BONFIRE]', 'Duplicate detected', {
      newSource: newBonfire.source,
      existingSource: existing.source,
      address: newBonfire.address
    });

    return {
      isDuplicate: true,
      existingId: existing.id,
      existingSource: existing.source
    };
  }

  return { isDuplicate: false };
}
```

**API Endpoint:**

```typescript
// POST /api/bonfires
export async function POST(request: Request) {
  const session = await auth();
  const data = await request.json();

  // Validate with Zod
  const validated = bonfireSchema.parse(data);

  // Check for duplicates
  const duplicate = await checkDuplicate(validated);

  if (duplicate.isDuplicate) {
    return Response.json({
      success: false,
      error: {
        message: "Bål allerede registrert",
        code: "DUPLICATE_BONFIRE",
        existingId: duplicate.existingId
      }
    }, { status: 409 });
  }

  // Create bonfire
  const bonfire = await prisma.bonfireRegistration.create({
    data: {
      ...validated,
      source: data.source,
      createdBy: session?.user?.id
    }
  });

  // Broadcast SSE update
  broadcastSSE({
    type: "bonfire_created",
    data: bonfire
  });

  return Response.json({
    success: true,
    data: bonfire
  });
}
```

**Monitoring Dashboard:**

```typescript
// Statistics for comparison
interface BonfireStats {
  automated: {
    total: number,
    successful: number,
    flagged: number,
    successRate: number
  },
  manual: {
    total: number
  },
  duplicates: {
    total: number,
    automatedVsAutomated: number,
    automatedVsManual: number,
    manualVsManual: number
  }
}
```

**Workflow Transition:**
- Week 2-3: Both systems active, monitor accuracy
- Week 4: When automated > 95% accuracy → prioritize automated path
- Future: Manual chatbot remains as backup for edge cases

---

### Pattern 4: Bonfire Status Lifecycle with Manual Override

**Purpose:** Automatically transition bonfire status based on date/time while allowing dispatchers to manually override when needed.

**Status Lifecycle:**

```
REGISTERED (Blue 🔥) → ACTIVE (Red 🔥) → FINISHED (Green 🔥) → REMOVED
     ↓                    ↓                    ↓
  Auto-activate      Auto-finish          Auto-remove
  at dateFrom        at dateTo            7 days later
```

**Status Colors and Icons:**

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| REGISTERED | Blue (#3B82F6) | 🔥 /icons/fire-registered.svg | Upcoming bonfire |
| ACTIVE | Red (#EF4444) | 🔥 /icons/fire-active.svg | Burning now (emergency attention) |
| FINISHED | Green (#10B981) | 🔥 /icons/fire-finished.svg | Completed |
| REMOVED | - | - | Deleted from map |

**Google Maps Marker Implementation:**

```typescript
function getMarkerIcon(status: BonfireStatus) {
  const iconUrls = {
    REGISTERED: '/icons/fire-registered.svg',
    ACTIVE: '/icons/fire-active.svg',
    FINISHED: '/icons/fire-finished.svg'
  };

  return {
    url: iconUrls[status],
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 32) // Bottom center
  };
}

// Marker creation
const marker = new google.maps.Marker({
  position: { lat: bonfire.lat, lng: bonfire.lng },
  map: map,
  icon: getMarkerIcon(bonfire.status),
  title: `${bonfire.name} - ${bonfire.address}`
});

// Marker click handler
marker.addListener('click', () => {
  showBonfireDetails(bonfire);
});
```

**Automated Status Transitions:**

```typescript
// Cron job runs every hour (Vercel Cron Jobs)
export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // REGISTERED → ACTIVE (dateFrom reached)
  const activated = await prisma.bonfireRegistration.updateMany({
    where: {
      status: "REGISTERED",
      dateFrom: { lte: now },
      autoStatusDisabled: false
    },
    data: {
      status: "ACTIVE",
      statusUpdatedAt: now
    }
  });

  // ACTIVE → FINISHED (dateTo passed)
  const finished = await prisma.bonfireRegistration.updateMany({
    where: {
      status: "ACTIVE",
      dateTo: { lte: now },
      autoStatusDisabled: false
    },
    data: {
      status: "FINISHED",
      statusUpdatedAt: now
    }
  });

  // FINISHED → REMOVED (7 days after dateTo)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const removed = await prisma.bonfireRegistration.updateMany({
    where: {
      status: "FINISHED",
      dateTo: { lte: sevenDaysAgo },
      autoStatusDisabled: false
    },
    data: {
      status: "REMOVED",
      statusUpdatedAt: now
    }
  });

  // Broadcast SSE updates if any changed
  if (activated.count > 0 || finished.count > 0 || removed.count > 0) {
    broadcastSSE({ type: "bonfire_status_bulk_update" });
  }

  return Response.json({
    success: true,
    activated: activated.count,
    finished: finished.count,
    removed: removed.count
  });
}
```

**Manual Status Override:**

```typescript
// UI: Click bonfire marker → Show details dialog
function BonfireDetailsDialog({ bonfire }: { bonfire: Bonfire }) {
  return (
    <Dialog>
      <DialogContent>
        <h2>{bonfire.name}</h2>
        <p>{bonfire.address}</p>
        <p>Dato: {format(bonfire.dateFrom, 'dd.MM.yyyy HH:mm')}</p>

        <div className="mt-4">
          <label>Status:</label>
          <select
            value={bonfire.status}
            onChange={(e) => updateBonfireStatus(bonfire.id, e.target.value)}
          >
            <option value="REGISTERED">Registrert</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="FINISHED">Avsluttet</option>
            <option value="REMOVED">Fjern</option>
          </select>
        </div>

        <p className="text-sm text-muted">
          Manuell endring deaktiverer automatiske statusoppdateringer
        </p>
      </DialogContent>
    </Dialog>
  );
}

// API: PATCH /api/bonfires/[id]
async function updateBonfireStatus(id: string, newStatus: string, userId: string) {
  const updated = await prisma.bonfireRegistration.update({
    where: { id },
    data: {
      status: newStatus,
      statusUpdatedAt: new Date(),
      statusUpdatedBy: userId,
      autoStatusDisabled: true // Disable automatic transitions
    }
  });

  // Broadcast SSE
  broadcastSSE({
    type: "bonfire_status_update",
    data: { id, status: newStatus }
  });

  return updated;
}
```

**Map Filtering:**

```typescript
// Filter controls on Bålmelding tab
function BonfireMapFilters() {
  const [filters, setFilters] = useState({
    registered: true,
    active: true,
    finished: true,
    removed: false
  });

  return (
    <div className="flex gap-4">
      <Checkbox
        checked={filters.registered}
        onChange={(checked) => setFilters({ ...filters, registered: checked })}
      >
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          Registrert
        </span>
      </Checkbox>

      <Checkbox checked={filters.active}>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          Aktiv
        </span>
      </Checkbox>

      <Checkbox checked={filters.finished}>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          Avsluttet
        </span>
      </Checkbox>
    </div>
  );
}
```

---

## Implementation Patterns

These patterns ensure all AI agents write compatible code throughout the project.

### Naming Conventions

**API Endpoints:**
- Format: `/api/{resource}` (plural for collections)
- Examples: `/api/events`, `/api/bonfires`, `/api/flash`
- Single resource: `/api/events/[id]`
- Special actions: `/api/bonfires/extract`

**Database Tables (Prisma):**
- Format: PascalCase, singular
- Examples: `User`, `Event`, `FlashMessage`, `VehicleStatus`, `BonfireRegistration`, `DutyRoster`, `AuditLog`

**Database Columns:**
- Format: camelCase
- Examples: `userId`, `createdAt`, `bonfireSize`, `dateFrom`, `dateTo`
- Foreign keys: `{model}Id` (e.g., `userId`, `eventId`)
- Timestamps: `createdAt`, `updatedAt`, `statusUpdatedAt`

**React Components:**
- Format: PascalCase
- File extension: `.tsx`
- Examples: `FlashMessageBar.tsx`, `VehicleStatusBox.tsx`, `BonfireMap.tsx`

**Functions and Variables:**
- Format: camelCase
- Examples: `handleBoxClick`, `toggleStatus`, `checkDuplicate`, `broadcastSSE`

**Zustand Stores:**
- Format: `use{Name}Store`
- File location: `src/stores/`
- Examples: `useAuthStore.ts`, `useFlashStore.ts`, `useConnectionStore.ts`

**Environment Variables:**
- Format: UPPER_SNAKE_CASE
- Examples: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `NEXTAUTH_SECRET`, `AZURE_OPENAI_ENDPOINT`

### Code Organization

**API Route Structure:**
```typescript
// src/app/api/{resource}/route.ts
export async function GET(request: Request) { }
export async function POST(request: Request) { }

// src/app/api/{resource}/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) { }
export async function PATCH(request: Request, { params }: { params: { id: string } }) { }
export async function DELETE(request: Request, { params }: { params: { id: string } }) { }
```

**Component Structure:**
```typescript
// Feature-based organization
src/components/
├── flash/
│   ├── FlashMessageBar.tsx
│   ├── FlashMessageInput.tsx
│   └── FlashMessageHistory.tsx
├── bilstatus/
│   ├── VehicleStatusBox.tsx
│   └── VehicleStatusToggle.tsx
└── ui/                    # shadcn/ui components
    ├── button.tsx
    └── ...
```

**Test Co-location:**
```
src/components/flash/FlashMessageBar.tsx
src/components/flash/FlashMessageBar.test.tsx
```

### API Response Format

**All API endpoints MUST use wrapped response format:**

```typescript
// Success response
{
  success: true,
  data: { ... }
}

// Error response
{
  success: false,
  error: {
    message: "User-friendly error message in Norwegian",
    code: "ERROR_CODE"
  }
}
```

**HTTP Status Codes:**
- 200: Success (GET, PATCH, DELETE)
- 201: Created (POST)
- 400: Bad request (validation error)
- 401: Unauthorized (not logged in)
- 403: Forbidden (not whitelisted or insufficient role)
- 404: Not found
- 409: Conflict (e.g., duplicate bonfire)
- 500: Server error

**Example API Implementation:**

```typescript
// POST /api/events/route.ts
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({
        success: false,
        error: {
          message: "Du må være logget inn",
          code: "UNAUTHORIZED"
        }
      }, { status: 401 });
    }

    const body = await request.json();
    const validated = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: {
        ...validated,
        createdBy: session.user.id
      }
    });

    broadcastSSE({ type: "event_created", data: event });

    return Response.json({
      success: true,
      data: event
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        error: {
          message: "Ugyldig data",
          code: "VALIDATION_ERROR"
        }
      }, { status: 400 });
    }

    console.error('[API]', 'Event creation failed', { error });
    return Response.json({
      success: false,
      error: {
        message: "Kunne ikke opprette hendelse",
        code: "INTERNAL_ERROR"
      }
    }, { status: 500 });
  }
}
```

### Error Handling

**Toast Notifications for Operational Errors:**

```typescript
// Using react-hot-toast
import toast from 'react-hot-toast';

// Success
toast.success('Flashmelding sendt');

// Warning
toast('SSE-tilkobling mistet, bruker polling', {
  icon: '⚠️',
  duration: 5000
});

// Error (auto-dismiss)
toast.error('Kunne ikke oppdatre bilstatus');

// Critical error (persistent)
toast.error('Databasetilkobling mistet', {
  duration: Infinity
});
```

**Inline Validation for Forms:**

```typescript
// Using React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd'),
  description: z.string().optional()
});

function EventForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span className="text-red-500">{errors.title.message}</span>}
    </form>
  );
}
```

### Logging Strategy

**Console Logging with Prefixes:**

```typescript
// Info - Normal operations
console.info('[FLASH]', 'Message sent', { userId, messageLength });
console.info('[BONFIRE]', 'Duplicate detected', { address, source });

// Warning - Recoverable issues
console.warn('[SSE]', 'Connection lost, retrying...');
console.warn('[API]', 'Validation warning', { field, value });

// Error - Errors that need attention
console.error('[API]', 'Database query failed', { error, query });
console.error('[AUTH]', 'Access denied', { email, reason });
```

**Vercel Logs Integration:**
- All console.log/info/warn/error automatically captured by Vercel
- View logs in Vercel dashboard
- Real-time log streaming during development
- Searchable and filterable in production

### Date and Time Handling

**Storage (Database):**
```typescript
// Always store as DateTime in UTC
createdAt DateTime @default(now())
dateFrom  DateTime
dateTo    DateTime
```

**API (JSON):**
```typescript
// Always send as ISO 8601 strings
{
  "dateFrom": "2025-06-23T20:00:00.000Z",
  "dateTo": "2025-06-23T23:59:59.999Z"
}
```

**Display (UI):**
```typescript
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

// Norwegian format
format(date, 'dd.MM.yyyy HH:mm', { locale: nb });
// Output: "23.06.2025 20:00"

// Relative time
formatDistanceToNow(date, { addSuffix: true, locale: nb });
// Output: "om 2 timer"
```

### Authentication and Authorization

**Session Check (API Routes):**

```typescript
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return Response.json({
      success: false,
      error: { message: "Ikke autentisert", code: "UNAUTHORIZED" }
    }, { status: 401 });
  }

  // Continue with authenticated logic
}
```

**Authorization Check:**

```typescript
function canDelete(resource: string, userRole: string): boolean {
  // All operators can delete operational data
  if (resource === "flash_message") return true;
  if (resource === "event") return true;
  if (resource === "vaktplan") return true;

  // Only admins can delete citizen data
  if (resource === "bonfire") return userRole === "admin";

  // Nobody can delete audit logs
  if (resource === "audit_log") return false;

  // Default: admin only
  return userRole === "admin";
}

// Usage in API route
if (!canDelete("bonfire", session.user.role)) {
  return Response.json({
    success: false,
    error: { message: "Ingen tilgang", code: "FORBIDDEN" }
  }, { status: 403 });
}
```

**Middleware (Protected Pages):**

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check whitelist
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|access-denied).*)',
  ],
};
```

### Zustand Store Patterns

**Store Definition:**

```typescript
// src/stores/useFlashStore.ts
import { create } from 'zustand';

interface FlashMessage {
  id: string;
  text: string;
  timestamp: Date;
  unread: boolean;
}

interface FlashStore {
  latestMessage: FlashMessage | null;
  history: FlashMessage[];
  setLatestMessage: (message: FlashMessage) => void;
  markAsRead: (id: string) => void;
  addToHistory: (message: FlashMessage) => void;
}

export const useFlashStore = create<FlashStore>((set) => ({
  latestMessage: null,
  history: [],

  setLatestMessage: (message) => set({ latestMessage: message }),

  markAsRead: (id) => set((state) => ({
    latestMessage: state.latestMessage?.id === id
      ? { ...state.latestMessage, unread: false }
      : state.latestMessage
  })),

  addToHistory: (message) => set((state) => ({
    history: [message, ...state.history].slice(0, 100) // Keep last 100
  }))
}));
```

**Store Usage:**

```typescript
// Component
import { useFlashStore } from '@/stores/useFlashStore';

function FlashMessageBar() {
  const latestMessage = useFlashStore(state => state.latestMessage);
  const markAsRead = useFlashStore(state => state.markAsRead);

  // Use store data
}
```

### SSE Event Format

**Server-Side (Broadcasting):**

```typescript
// All SSE events use consistent format
interface SSEEvent {
  type: string;
  data: any;
  timestamp: string; // ISO 8601
}

function broadcastSSE(event: SSEEvent) {
  const message = JSON.stringify({
    type: event.type,
    data: event.data,
    timestamp: new Date().toISOString()
  });

  // Send to all connected clients
  clients.forEach(client => {
    client.write(`data: ${message}\n\n`);
  });
}

// Event types
broadcastSSE({ type: "flash_message", data: { ... } });
broadcastSSE({ type: "bilstatus_update", data: { ... } });
broadcastSSE({ type: "event_created", data: { ... } });
broadcastSSE({ type: "bonfire_created", data: { ... } });
broadcastSSE({ type: "bonfire_status_update", data: { ... } });
```

**Client-Side (Receiving):**

```typescript
// src/lib/sse.ts
export function createSSEConnection() {
  const eventSource = new EventSource('/api/sse');

  eventSource.onmessage = (event) => {
    const { type, data, timestamp } = JSON.parse(event.data);

    switch (type) {
      case "flash_message":
        useFlashStore.getState().setLatestMessage(data);
        break;

      case "bilstatus_update":
        useBilstatusStore.getState().updateStatus(data);
        break;

      case "event_created":
        useEventStore.getState().addEvent(data);
        break;

      // ... handle other event types
    }
  };

  eventSource.onerror = () => {
    console.warn('[SSE]', 'Connection lost, retrying...');
    // Automatic reconnection via EventSource
  };

  return eventSource;
}
```

### Database Audit Logging

**Prisma Middleware (Automatic Logging):**

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  const result = await next(params);

  // Log all mutations (create, update, delete)
  if (['create', 'update', 'delete', 'updateMany', 'deleteMany'].includes(params.action)) {
    const userId = await getCurrentUserId(); // From auth context
    const userEmail = await getCurrentUserEmail();

    await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        action: params.action.toUpperCase(),
        tableName: params.model || 'unknown',
        recordId: result?.id || null,
        oldValues: params.action === 'update' ? await getOldValues(params) : null,
        newValues: result,
        timestamp: new Date()
      }
    });
  }

  return result;
});

export default prisma;
```

**Audit Log Query API:**

```typescript
// GET /api/audit?table=Event&userId=123&from=2025-01-01
export async function GET(request: Request) {
  const session = await auth();
  if (session.user.role !== 'admin') {
    return Response.json({
      success: false,
      error: { message: "Bare administratorer kan se audit logger", code: "FORBIDDEN" }
    }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const userId = searchParams.get('userId');
  const from = searchParams.get('from');

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(table && { tableName: table }),
      ...(userId && { userId }),
      ...(from && { timestamp: { gte: new Date(from) } })
    },
    orderBy: { timestamp: 'desc' },
    take: 100
  });

  return Response.json({ success: true, data: logs });
}
```

---

## Data Architecture

### Complete Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// Authentication Tables (NextAuth.js v5)
// ============================================

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

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// Application Tables
// ============================================

model FlashMessage {
  id        String   @id @default(uuid())
  message   String
  sentBy    String
  sentAt    DateTime @default(now())

  @@index([sentAt])
}

model Event {
  id          String   @id @default(uuid())
  title       String
  description String?
  priority    String   @default("normal") // "normal" | "pri1"
  status      String   @default("active") // "active" | "resolved"

  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status, createdAt])
  @@index([priority])
}

model VehicleStatus {
  id        String   @id @default(uuid())
  vehicle   String   @unique // "S111" | "S112"
  status    String   // "green" | "red" | "grey"
  comment   String?  // Optional note for any status
  greyNote  String?  // Required note when grey

  updatedBy String
  updatedAt DateTime @updatedAt

  @@index([vehicle, status])
}

model DutyRoster {
  id       String   @id @default(uuid())
  week     Int      // Week number (1-53)
  year     Int      // Year (e.g., 2025)
  position String   // "vakthavende brannsjef", "innsatsleder brann", etc.
  name     String   // Assigned person name

  updatedBy String
  updatedAt DateTime @updatedAt

  @@unique([week, year, position])
  @@index([week, year])
}

model BonfireRegistration {
  id           String   @id @default(uuid())
  source       String   // "automated" | "manual_chatbot"
  status       String   @default("REGISTERED") // "REGISTERED" | "ACTIVE" | "FINISHED" | "REMOVED"

  // Citizen data
  name         String
  phone        String
  address      String
  lat          Float
  lng          Float
  municipality String
  bonfireSize  String?
  dateFrom     DateTime
  dateTo       DateTime
  notes        String?

  // Validation tracking
  validated    Boolean  @default(false)

  // Status management
  statusUpdatedAt    DateTime  @default(now())
  statusUpdatedBy    String?
  autoStatusDisabled Boolean   @default(false)

  // Metadata
  createdAt    DateTime @default(now())
  createdBy    String?

  @@index([status, dateFrom])
  @@index([address, dateFrom]) // Duplicate detection
  @@index([municipality, status])
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  userEmail  String
  action     String   // "CREATE" | "UPDATE" | "DELETE"
  tableName  String
  recordId   String?
  oldValues  Json?
  newValues  Json
  timestamp  DateTime @default(now())

  @@index([timestamp(sort: Desc)])
  @@index([tableName, timestamp])
  @@index([userId, timestamp])
}
```

### Database Relationships

- User 1:N Account (NextAuth OAuth accounts)
- User 1:N Session (NextAuth sessions)
- All operational tables reference User.id via createdBy/updatedBy
- AuditLog records reference all tables via tableName + recordId

### Indexes Strategy

**Performance-Critical Queries:**
- Flash messages: Recent messages (sentAt DESC)
- Events: Active events by priority (status, priority, createdAt)
- Bonfires: Map display by status (status, municipality)
- Bonfires: Duplicate detection (address, dateFrom)
- Audit logs: Time-based queries (timestamp DESC, userId + timestamp)

---

## Security Architecture

### Authentication

**Google OAuth 2.0 via NextAuth.js v5:**
- No password storage in application
- OAuth flow handled by Google
- JWT-based sessions (serverless-friendly)
- 16-hour session expiration (accommodates 12-hour shift + 4-hour emergency extension)
- Automatic token refresh

**Configuration:**

```typescript
// src/lib/auth.config.ts (Edge-compatible)
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/access-denied',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/hva-skjer');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      return true;
    },
  },
  providers: [], // Added in auth.ts
} satisfies NextAuthConfig;

// src/lib/auth.ts (Full config with Prisma)
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { authConfig } from './auth.config';
import prisma from './prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 16 * 60 * 60, // 16 hours
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check whitelist
      const whitelistedUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!whitelistedUser || !whitelistedUser.whitelisted) {
        return '/access-denied';
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        token.role = dbUser?.role || 'operator';
        token.id = dbUser?.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

### Authorization

**Role-Based Access Control (RBAC):**

| Resource | Operator | Administrator |
|----------|----------|---------------|
| **Flash Messages** | Create, Read, Delete | All |
| **Events** | Create, Read, Update, Delete | All |
| **Bilstatus** | Read, Update | All |
| **Vaktplan** | Read, Update, Delete entries | All |
| **Bonfires** | Create, Read, Update status | All + Delete |
| **Audit Logs** | - | Read only |
| **User Whitelist** | - | Manage |

**Implementation:**

```typescript
// Authorization helper
export function authorize(
  session: Session | null,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  if (!session) return false;

  const role = session.user.role;

  // Operators can manage operational data
  if (role === 'operator') {
    if (resource === 'flash' && ['create', 'read', 'delete'].includes(action)) return true;
    if (resource === 'event' && ['create', 'read', 'update', 'delete'].includes(action)) return true;
    if (resource === 'bilstatus' && ['read', 'update'].includes(action)) return true;
    if (resource === 'vaktplan' && ['read', 'update', 'delete'].includes(action)) return true;
    if (resource === 'bonfire' && ['create', 'read', 'update'].includes(action)) return true;
  }

  // Admins have full access
  if (role === 'admin') return true;

  return false;
}
```

### Input Validation

**Zod Schemas (Client + Server):**

```typescript
// src/lib/validators.ts
import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd').max(50),
  description: z.string().max(200).optional(),
  priority: z.enum(['normal', 'pri1']).default('normal'),
});

export const bonfireSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^\d{8}$/, 'Ugyldig telefonnummer'),
  address: z.string().min(1),
  municipality: z.string().min(1),
  bonfireSize: z.string().optional(),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
  notes: z.string().optional(),
});

export const flashMessageSchema = z.object({
  message: z.string().min(1).max(100),
});

// Usage in API route
const validated = eventSchema.parse(requestBody);
```

### Data Protection

**Encryption:**
- At rest: Database encryption (Vercel Postgres provider)
- In transit: TLS 1.3 (automatic via Vercel)
- Sensitive env vars: Never committed to git (.env.local in .gitignore)

**API Key Security:**
```typescript
// Environment variables only
GOOGLE_MAPS_API_KEY=xxx        # HTTP Referer restrictions in Google Cloud Console
AZURE_OPENAI_API_KEY=xxx       # IP restrictions in Azure
GOOGLE_CLIENT_SECRET=xxx       # Never exposed to client
NEXTAUTH_SECRET=xxx            # Strong random string

// Rotation schedule
// Google Maps API Key: Every 90 days
// Azure OpenAI API Key: Every 90 days
// NextAuth Secret: On security incidents only
```

**XSS Prevention:**
- React automatic escaping
- Content Security Policy headers
- Sanitize user input with Zod

**SQL Injection Prevention:**
- Prisma ORM parameterized queries (automatic)
- No raw SQL queries

**CSRF Protection:**
- NextAuth SameSite cookies
- CSRF tokens in forms

---

## Performance Considerations

### Response Time Targets

| Operation | Target | Rationale |
|-----------|--------|-----------|
| Flash message delivery | < 1 second | Critical for emergency coordination |
| API response time | < 500ms | Fast feedback during high-pressure work |
| SSE notification delivery | < 1 second | Real-time operational awareness |
| Initial page load | < 3 seconds | Acceptable for cloud hosting |
| Map rendering (100 markers) | < 2 seconds | Quick fire verification |
| Map rendering (500+ markers) | < 3 seconds | With clustering |

### Optimization Strategies

**Database:**
- Connection pooling (Prisma default)
- Strategic indexes on frequently queried fields
- Composite indexes for complex queries
- Query result caching where appropriate

**Frontend:**
- Code splitting via Next.js dynamic imports
- Lazy loading for non-critical components
- Image optimization (next/image)
- Bundle size monitoring

**Real-Time:**
- SSE over WebSocket (lower overhead for one-way broadcasts)
- Debounced updates for high-frequency events
- Edge functions for lower latency

**Maps:**
- Marker clustering (@googlemaps/markerclusterer)
- Lazy loading map library
- Only load visible bonfire markers
- Debounced status filter updates

---

## Deployment Architecture

### Vercel Platform

**Production Environment:**
- Automatic HTTPS/TLS
- Edge network (low latency globally)
- Serverless functions (auto-scaling)
- Edge functions for SSE
- Continuous deployment from Git

**Environment Variables (Vercel Dashboard):**
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://hva-skjer.vercel.app
NEXTAUTH_SECRET=<generate-strong-random-string>
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Google Maps
GOOGLE_MAPS_API_KEY=xxx

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Cron secret
CRON_SECRET=<generate-strong-random-string>
```

**Build Configuration:**
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // Google profile images
  },
  // Vercel analytics
  experimental: {
    instrumentationHook: true,
  },
};
```

### Database Hosting

**Vercel Postgres:**
- Managed PostgreSQL service
- Automatic backups
- Connection pooling
- Zero-config integration with Vercel

**Free Tier Limits:**
- 256 MB storage
- 60 hours compute time/month
- Sufficient for 4-6 users with moderate usage

### Monitoring

**Vercel Dashboard:**
- Deployment logs
- Function execution logs
- Error tracking
- Performance metrics

**Application Logging:**
- Console logs captured by Vercel
- Search and filter in dashboard
- Real-time log streaming

**Health Checks:**
- Uptime monitoring via Vercel
- SSE connection status indicator in UI
- Database connection error handling

---

## Development Environment

### Prerequisites

- Node.js 22.x or 24.x LTS
- npm 10.x or pnpm 9.x
- Git
- Google Cloud Console account (OAuth credentials)
- Azure account (OpenAI access)
- Vercel account (deployment)

### Setup Commands

```bash
# Clone repository
git clone <repository-url>
cd hva-skjer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Run tests
npm run test
npm run test:e2e

# Build for production
npm run build

# Deploy to Vercel
vercel
```

### Environment Variables (.env.local)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hva-skjer"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Maps
GOOGLE_MAPS_API_KEY="your-maps-api-key"

# Azure OpenAI
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
AZURE_OPENAI_API_KEY="your-azure-openai-key"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"

# Cron (for local testing)
CRON_SECRET="local-cron-secret"
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Server-Sent Events over WebSockets

**Context:** Real-time communication needed for flash messages, bilstatus, and event updates.

**Decision:** Use Server-Sent Events (SSE) with automatic polling fallback.

**Rationale:**
- Flash messages are one-way broadcasts (perfect for SSE)
- No external service required (free)
- Native browser support with automatic reconnection
- Works with Vercel serverless (edge functions)
- Simpler implementation than WebSockets
- Meets < 1 second latency requirement

**Consequences:**
- Cannot do bidirectional communication (not needed)
- 10-second Vercel function timeout (mitigated with edge functions)
- Polling fallback ensures reliability

---

### ADR-002: Always-Visible Flash Message Bar

**Context:** Original design had flash messages auto-switch tabs, potentially interrupting dispatcher work.

**Decision:** Place flash message bar at top of application, visible in all tabs, eliminating auto-switch behavior.

**Rationale:**
- Emergency dispatchers should not be interrupted during active work
- Flash messages are urgent but not so urgent they warrant disruption
- Always visible = can't be missed
- Simpler implementation (no complex tab switching logic)
- Better UX for 24/7 operations

**Consequences:**
- Flash tab becomes history view only
- Clearer separation between notification and history
- Removed need for smart typing detection

---

### ADR-003: Zustand over Context API

**Context:** Client-side state management needed for auth, tabs, flash messages, connections.

**Decision:** Use Zustand for client state management.

**Rationale:**
- Lightweight (1 KB) vs Redux Toolkit
- Better performance than Context API (selective subscriptions)
- Simpler API than Redux
- Perfect for medium-sized apps
- Great TypeScript support
- Works well with Next.js App Router

**Consequences:**
- One additional dependency
- Team needs to learn Zustand API (minimal learning curve)

---

### ADR-004: Parallel AI Automation with Duplicate Detection

**Context:** Need to automate bonfire registration but ensure AI accuracy before full automation.

**Decision:** Run Phase 1 (manual chatbot) and Phase 2 (automated) in parallel with duplicate detection.

**Rationale:**
- Real-world comparison of AI vs manual extraction
- Duplicate detection prevents double-entry
- Gradual trust building with operators
- Can measure AI accuracy in production
- Always have manual fallback

**Consequences:**
- More complex implementation initially
- Requires duplicate detection logic
- Benefits: Faster validation, higher confidence, better monitoring

---

### ADR-005: Bonfire Status Lifecycle with Color-Coded Icons

**Context:** Dispatchers need quick visual identification of bonfire status during fire calls.

**Decision:** Four-state lifecycle (REGISTERED/ACTIVE/FINISHED/REMOVED) with color-coded fire icons (blue/red/green).

**Rationale:**
- Red for ACTIVE bonfire = immediate emergency attention
- Color coding = instant recognition during stress
- Fire icons = intuitive (better than generic markers)
- Automated transitions = reduces manual work
- Manual override = handles edge cases

**Consequences:**
- Requires cron job for automatic transitions
- Need custom fire icon SVGs
- Manual override flag to prevent auto-transitions

---

### ADR-006: Hybrid Database Architecture (PostgreSQL + Azure Table Storage)

**Context:** Project developed in parallel by two students. One student implemented bonfire system using Azure Table Storage while the other implemented core dashboard with PostgreSQL/Prisma. Need to integrate both systems.

**Decision:** Use hybrid database architecture:
- **PostgreSQL (Prisma)** for: Users, Events, Flash Messages, Vehicle Status, Duty Roster, Audit Logs (Epic 1-4)
- **Azure Table Storage** for: Bonfire Registrations (Epic 5)

**Rationale:**
- Parallel development efficiency - students worked independently
- Azure Table Storage is GDPR-compliant (Microsoft Azure has EU data residency)
- Azure Student subscription provides free Table Storage access
- Bonfire data is self-contained with no foreign keys to other entities
- Avoids complex data migration under time constraints
- Both solutions are production-ready

**Authentication Integration:**
- NextAuth.js with Google OAuth remains single auth source for entire app
- Admin routes in bonfire system protected by NextAuth session
- Cookie-based admin auth in PR #8 will be replaced with NextAuth middleware

**Consequences:**
- Two database connections to manage (Prisma + Azure SDK)
- Bonfire data not queryable via Prisma (separate API layer)
- Cross-system reporting requires API aggregation
- Must document this deviation in project report
- Future migration path: Azure Table → PostgreSQL if needed

**Date:** 2025-11-26
**Status:** Accepted

---

## Next Steps

After architecture is approved:

1. **Run Epic Breakdown Workflow** (if not already done)
   - Command: `/bmad:bmm:workflows:create-epics-and-stories`
   - Creates bite-sized stories from PRD

2. **Run Sprint Planning Workflow**
   - Command: `/bmad:bmm:workflows:sprint-planning`
   - Creates sprint-status.yaml tracking file
   - Extracts all stories from epics

3. **Start Story Implementation**
   - Command: `/bmad:bmm:workflows:create-story`
   - Generates first story: 1.1 - Project Initialization
   - Run dev agent to implement story

4. **Iterate Through Stories**
   - Story → Story Context → Dev Agent → Code Review → Done
   - Repeat for all 34 stories across 5 epics

---

## References

- **PRD:** [docs/PRD.md](./PRD.md)
- **Epics:** [docs/epics.md](./epics.md)
- **Product Brief:** [docs/product-brief-hva-skjer-2025-11-10.md](./product-brief-hva-skjer-2025-11-10.md)
- **Next.js Documentation:** https://nextjs.org/docs
- **Prisma Documentation:** https://www.prisma.io/docs
- **NextAuth.js v5 Documentation:** https://authjs.dev
- **shadcn/ui Documentation:** https://ui.shadcn.com
- **Google Maps JavaScript API:** https://developers.google.com/maps/documentation/javascript
- **Azure OpenAI Documentation:** https://learn.microsoft.com/en-us/azure/ai-services/openai/

---

_This architecture ensures AI agents implement Hva Skjer with consistency, optimizing for emergency response operations where seconds matter._

_Generated by BMad Decision Architecture Workflow v1.3.2_
_Date: 2025-11-13_
_For: BIP_
