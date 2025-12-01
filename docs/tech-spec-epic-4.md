# Epic 4: Flash Message System - Technical Specification

**Project:** ibe160 - Hva Skjer
**Epic:** 4 - Flash Message System
**Author:** BIP
**Date:** 2025-11-30
**Version:** 1.0

---

## Executive Summary

Epic 4 delivers a real-time urgent dispatcher-to-dispatcher communication system. Flash messages enable instant, broadcast communication across all connected dispatchers with attention-grabbing visual cues. This system replaces informal communication methods (phone, shouting) with a fast, auditable mechanism where every feature is optimized for seconds saved during emergencies.

### Key Deliverables
- Two-key keyboard shortcut (Ctrl+Shift+F) for instant message input
- Sub-second broadcast to all connected dispatchers via SSE
- Attention-grabbing blink animations (3 quick + continuous)
- Smart typing detection (context-aware auto-switch)
- Message history with 24-hour retention
- Auto-return timer (5 minutes)
- Performance optimized for < 1 second delivery

---

## Prerequisites

### From Epic 1 (Foundation)
- ✅ SSE infrastructure established ([app/api/sse/route.ts](../app/api/sse/route.ts))
- ✅ SSE client manager ([lib/sse.ts](../lib/sse.ts))
- ✅ `FlashMessage` Prisma model defined ([prisma/schema.prisma](../prisma/schema.prisma))
- ✅ Audit logging infrastructure
- ✅ Tab navigation structure (Hva Skjer, Flash, Bålmelding, Innstillinger)

### From Epic 2 (Authentication)
- ✅ NextAuth.js session management
- ✅ User authentication required for sending messages
- ✅ Session includes user.id for createdBy field

### From Epic 3 (Event Control)
- ✅ Real-time sync patterns established (used for events, bilstatus, vaktplan)
- ✅ Dashboard layout with FlashBar component ([components/layout/flash-bar.tsx](../components/layout/flash-bar.tsx))

---

## Existing Infrastructure Analysis

### Current FlashBar Component
The existing `FlashBar` component provides:
- Basic UI for displaying/sending flash messages
- Local state management (not connected to database)
- Input handling with Enter key support

**Missing Features (to be implemented):**
- Database persistence
- SSE broadcast to other dispatchers
- Blink animations
- Keyboard shortcut (Ctrl+Shift+F)
- Message acknowledgment tracking
- Smart typing detection
- Auto-return timer

### SSE Infrastructure
The SSE system is fully operational:
- Client registration/deregistration
- Broadcast capability via `broadcastEvent()` in [lib/sse.ts](../lib/sse.ts)
- Heartbeat for connection keep-alive
- Already used for events, bilstatus, vaktplan, talegrupper

### Database Model
```prisma
model FlashMessage {
  id        String   @id @default(uuid())
  content   String   @db.VarChar(100)
  createdBy String
  createdAt DateTime @default(now())
  expiresAt DateTime // Auto-archive after 24 hours

  @@index([createdAt])
}
```

---

## Story Breakdown

### Story 4.1: Flash Message Basic Send and Receive

**Goal:** Enable dispatchers to send flash messages that all dispatchers see instantly.

**Implementation:**

1. **API Endpoint:** `POST /api/flash`
   ```typescript
   // POST /api/flash/route.ts
   export async function POST(request: Request) {
     const session = await auth();
     if (!session) return unauthorized();

     const { content } = await request.json();

     // Validate (1-100 chars)
     const validated = flashMessageSchema.parse({ content });

     // Create in database
     const message = await prisma.flashMessage.create({
       data: {
         content: validated.content,
         createdBy: session.user.id,
         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
       },
     });

     // Broadcast via SSE
     broadcastEvent("flash_message", {
       id: message.id,
       content: message.content,
       createdAt: message.createdAt.toISOString(),
     });

     // Audit log
     await createAuditLog(session.user.id, "FlashMessage", message.id, "CREATE");

     return Response.json({ success: true, data: message });
   }
   ```

2. **API Endpoint:** `GET /api/flash`
   - Return last 3 messages (or paginated history)
   - Used for initial page load and history view

3. **Update FlashBar Component:**
   - Connect to SSE for receiving messages
   - Call `POST /api/flash` when sending
   - Display received messages from other dispatchers

4. **Keyboard Shortcut (Ctrl+Shift+F):**
   - Global event listener in dashboard layout
   - Focus the flash input field when triggered
   - Works from any tab/folder

**Acceptance Criteria:**
- Message sent → appears on all dispatcher screens < 1 second
- Message includes automatic timestamp
- No sender identification displayed (anonymous broadcast)
- Keyboard shortcut works from any folder

---

### Story 4.2: Blink Animation and Acknowledgment

**Goal:** Flash messages grab attention with prominent blink animations.

**Implementation:**

1. **CSS Animations:**
   ```css
   /* globals.css */
   @keyframes flash-quick {
     0%, 100% { opacity: 1; }
     50% { opacity: 0; }
   }

   @keyframes flash-continuous {
     0%, 100% {
       background-color: hsl(var(--destructive));
       color: hsl(var(--destructive-foreground));
     }
     50% {
       background-color: hsl(var(--destructive) / 0.3);
       color: hsl(var(--foreground));
     }
   }

   .animate-flash-quick {
     animation: flash-quick 0.4s ease-in-out 3;
   }

   .animate-flash-continuous {
     animation: flash-continuous 2s ease-in-out infinite;
   }
   ```

2. **Blink State Management:**
   ```typescript
   // Zustand store for flash state
   interface FlashStore {
     latestMessage: FlashMessage | null;
     isBlinking: boolean;
     blinkPhase: 'quick' | 'continuous' | 'none';
     acknowledgedIds: Set<string>;

     setLatestMessage: (message: FlashMessage) => void;
     acknowledge: (id: string) => void;
     startBlinking: () => void;
     stopBlinking: () => void;
   }
   ```

3. **Blink Sequence:**
   - New message arrives → 3 quick blinks (0.2s on, 0.2s off) of entire app
   - After quick blinks → message bar blinks continuously (1s on, 1s off)
   - Click message → stop blinking, mark as acknowledged
   - Store acknowledged IDs in localStorage for persistence

4. **Visual Indicator:**
   - Badge showing unread message count if multiple
   - Different styling for unread vs read messages

**Acceptance Criteria:**
- 3 quick blinks followed by continuous blinking
- Clicking message stops blinking immediately
- Unread count indicator visible
- Works reliably in Edge and Chrome

---

### Story 4.3: Smart Typing Detection and Auto-Switch

**Goal:** Avoid interrupting dispatchers who are actively typing.

**Implementation:**

1. **Typing Detection Hook:**
   ```typescript
   // hooks/useTypingDetection.ts
   export function useTypingDetection(threshold = 3000) {
     const [isTyping, setIsTyping] = useState(false);
     const lastKeypressRef = useRef<number>(0);

     useEffect(() => {
       const handleKeypress = () => {
         lastKeypressRef.current = Date.now();
         setIsTyping(true);
       };

       const checkTyping = setInterval(() => {
         const timeSinceLastKeypress = Date.now() - lastKeypressRef.current;
         setIsTyping(timeSinceLastKeypress < threshold);
       }, 500);

       document.addEventListener('keypress', handleKeypress);
       return () => {
         document.removeEventListener('keypress', handleKeypress);
         clearInterval(checkTyping);
       };
     }, [threshold]);

     return isTyping;
   }
   ```

2. **Auto-Switch Logic:**
   - Flash message received
   - Check if user is typing (keyboard activity in last 3 seconds)
   - If NOT typing → auto-navigate to Flash folder
   - If typing → Flash tab blinks instead of auto-switch
   - Manual tab switch always overrides auto-switch

3. **Tab Blink Animation:**
   ```typescript
   // Blink the Flash tab button when message arrives and user is typing
   <TabsTrigger
     className={cn(
       isTyping && hasUnreadFlash && "animate-pulse border-destructive"
     )}
   >
     Flash
   </TabsTrigger>
   ```

**Acceptance Criteria:**
- Typing detection accuracy > 95%
- Auto-switch only when not typing
- Flash tab blinks visibly when typing
- Manual tab switching takes priority

---

### Story 4.4: Message History and Multiple Messages

**Goal:** View recent flash messages and navigate between them.

**Implementation:**

1. **Flash Folder Page:** `app/flash/page.tsx`
   ```typescript
   export default function FlashPage() {
     const { data: messages } = useSWR('/api/flash?limit=50');

     return (
       <div className="p-4 space-y-4">
         <h1 className="text-2xl font-bold">Flash-meldinger</h1>

         {/* Message history list */}
         <div className="space-y-2">
           {messages?.map((msg) => (
             <FlashMessageCard
               key={msg.id}
               message={msg}
               isUnread={!acknowledgedIds.has(msg.id)}
             />
           ))}
         </div>

         {/* Load more button */}
         <Button onClick={loadMore}>Last flere</Button>
       </div>
     );
   }
   ```

2. **Pagination:**
   - Initial display: 3 most recent messages in FlashBar dropdown
   - Full history: Load more button or infinite scroll in Flash folder
   - Sort by createdAt DESC (newest first)

3. **Read/Unread Styling:**
   - Unread: Bold text, highlighted background
   - Read: Normal weight, subtle background
   - Mark as read when viewed or clicked

4. **24-Hour Archive:**
   - Cron job to delete messages older than 24 hours
   - OR set `expiresAt` and filter on queries

**Acceptance Criteria:**
- Last 3 messages in FlashBar quick-view
- Full history in Flash folder
- Visual distinction for unread messages
- Newest messages displayed first

---

### Story 4.5: Auto-Return Timer and Flash Folder UI

**Goal:** Auto-return to "Hva Skjer" after 5 minutes of inactivity in Flash folder.

**Implementation:**

1. **Auto-Return Hook:**
   ```typescript
   // hooks/useAutoReturn.ts
   export function useAutoReturn(
     currentPath: string,
     targetPath: string,
     timeoutMs = 5 * 60 * 1000
   ) {
     const router = useRouter();
     const timeoutRef = useRef<NodeJS.Timeout>();

     const resetTimer = useCallback(() => {
       if (timeoutRef.current) clearTimeout(timeoutRef.current);

       if (currentPath === '/flash') {
         timeoutRef.current = setTimeout(() => {
           router.push(targetPath);
         }, timeoutMs);
       }
     }, [currentPath, targetPath, timeoutMs, router]);

     useEffect(() => {
       // Reset on any user interaction
       const events = ['click', 'keypress', 'mousemove', 'touchstart'];
       events.forEach(e => document.addEventListener(e, resetTimer));

       resetTimer();

       return () => {
         events.forEach(e => document.removeEventListener(e, resetTimer));
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
       };
     }, [resetTimer]);
   }
   ```

2. **Flash Folder Layout:**
   - Top section: Send new message (same input as FlashBar)
   - Bottom section: Message history list
   - Clear "return to Hva Skjer" button

3. **Timer Cancellation:**
   - Manual tab switching cancels timer
   - Timer resets on any user interaction
   - Timer only active when on Flash folder

**Acceptance Criteria:**
- Auto-return after 5 minutes of inactivity
- Timer resets on user interaction
- Manual navigation cancels auto-return
- Flash folder shows both write interface and history

---

### Story 4.6: Flash Message Performance Optimization

**Goal:** Ensure < 1 second delivery across all dispatchers.

**Implementation:**

1. **Performance Metrics:**
   - Measure round-trip time: send → broadcast → receive → display
   - Target: < 800ms average, < 1000ms P95

2. **Optimizations:**
   - SSE already on Node.js runtime (shared memory)
   - Minimize database write latency
   - Parallel: DB write + SSE broadcast
   - Edge caching for static assets

3. **Testing Strategy:**
   - Multiple browser tabs simulating 4-6 dispatchers
   - Measure delivery time across all tabs
   - Network throttling tests

4. **Connection Status Indicator:**
   ```typescript
   // Optional: Show SSE connection status
   <div className={cn(
     "w-2 h-2 rounded-full",
     isConnected ? "bg-green-500" : "bg-red-500"
   )} />
   ```

5. **Fallback to Polling:**
   - If SSE fails, fall back to 5-second polling
   - Show warning toast when using fallback
   - Auto-reconnect SSE when available

**Acceptance Criteria:**
- < 1 second delivery to 4-6 concurrent users
- No lost messages during testing
- Handles 10-30 messages per shift without degradation
- Connection status visible (optional)

---

## Technical Architecture

### Data Flow

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Dispatcher A  │     │   Server     │     │   Dispatcher B  │
│                 │     │              │     │                 │
│ [Ctrl+Shift+F]  │     │              │     │                 │
│      ↓          │     │              │     │                 │
│ Type message    │     │              │     │                 │
│      ↓          │     │              │     │                 │
│ POST /api/flash ├────►│ Validate     │     │                 │
│                 │     │      ↓       │     │                 │
│                 │     │ DB Write     │     │                 │
│                 │     │      ↓       │     │                 │
│                 │     │ SSE Broadcast├────►│ Receive via SSE │
│                 │     │              │     │      ↓          │
│                 │◄────┤              │     │ Update UI       │
│ Response + SSE  │     │              │     │      ↓          │
│      ↓          │     │              │     │ Blink animation │
│ Update own UI   │     │              │     │                 │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

### State Management

```typescript
// stores/useFlashStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FlashMessage {
  id: string;
  content: string;
  createdAt: string;
  createdBy?: string;
}

interface FlashStore {
  latestMessage: FlashMessage | null;
  messages: FlashMessage[];
  acknowledgedIds: string[];
  isBlinking: boolean;
  blinkPhase: 'quick' | 'continuous' | 'none';

  // Actions
  addMessage: (message: FlashMessage) => void;
  acknowledge: (id: string) => void;
  setBlinking: (phase: 'quick' | 'continuous' | 'none') => void;
  clearExpired: () => void;
}

export const useFlashStore = create<FlashStore>()(
  persist(
    (set, get) => ({
      latestMessage: null,
      messages: [],
      acknowledgedIds: [],
      isBlinking: false,
      blinkPhase: 'none',

      addMessage: (message) => set((state) => ({
        latestMessage: message,
        messages: [message, ...state.messages].slice(0, 100),
        blinkPhase: 'quick',
        isBlinking: true,
      })),

      acknowledge: (id) => set((state) => ({
        acknowledgedIds: [...state.acknowledgedIds, id],
        isBlinking: state.latestMessage?.id === id ? false : state.isBlinking,
        blinkPhase: state.latestMessage?.id === id ? 'none' : state.blinkPhase,
      })),

      setBlinking: (phase) => set({
        blinkPhase: phase,
        isBlinking: phase !== 'none',
      }),

      clearExpired: () => set((state) => ({
        messages: state.messages.filter(
          m => new Date(m.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ),
      })),
    }),
    {
      name: 'flash-storage',
      partialize: (state) => ({ acknowledgedIds: state.acknowledgedIds }),
    }
  )
);
```

### SSE Event Types

```typescript
// Add to lib/sse.ts event types
type SSEEventType =
  | 'connection'
  | 'event_created' | 'event_updated' | 'event_deleted'
  | 'bilstatus_update'
  | 'vaktplan_update'
  | 'talegruppe_created' | 'talegruppe_updated' | 'talegruppe_deleted'
  | 'flash_message';  // NEW

// SSE event payload for flash messages
interface FlashMessageEvent {
  type: 'flash_message';
  data: {
    id: string;
    content: string;
    createdAt: string;
  };
  timestamp: string;
}
```

---

## API Endpoints

### POST /api/flash
Create and broadcast a new flash message.

**Request:**
```json
{
  "content": "Trenger BAPS"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Trenger BAPS",
    "createdBy": "user-id",
    "createdAt": "2025-11-30T10:00:00.000Z",
    "expiresAt": "2025-12-01T10:00:00.000Z"
  }
}
```

### GET /api/flash
Retrieve flash message history.

**Query Parameters:**
- `limit` (optional): Number of messages (default: 3, max: 100)
- `cursor` (optional): Pagination cursor (message ID)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Stand by",
      "createdAt": "2025-11-30T10:00:00.000Z"
    }
  ],
  "nextCursor": "uuid-or-null"
}
```

---

## Files to Create/Modify

### New Files
- `app/api/flash/route.ts` - Flash message API
- `app/flash/page.tsx` - Flash folder page
- `stores/useFlashStore.ts` - Zustand store
- `hooks/useTypingDetection.ts` - Typing detection hook
- `hooks/useAutoReturn.ts` - Auto-return timer hook
- `components/flash/FlashMessageCard.tsx` - Message card component

### Modified Files
- `components/layout/flash-bar.tsx` - Add SSE integration, blink animations
- `components/layout/dashboard-tabs.tsx` - Add auto-switch logic
- `app/globals.css` - Add blink animations
- `lib/sse.ts` - Add flash_message event type

---

## Testing Strategy

### Unit Tests
- Zustand store actions
- Typing detection hook
- Auto-return timer logic

### Integration Tests
- API endpoint responses
- Database persistence
- SSE broadcast delivery

### E2E Tests (Playwright)
- Full send → receive → acknowledge flow
- Keyboard shortcut functionality
- Blink animation behavior
- Auto-switch with typing detection
- Auto-return timer

### Performance Tests
- Delivery latency measurement
- Multiple concurrent users
- Network condition variations

---

## Security Considerations

- **Authentication required:** All API calls require valid session
- **Rate limiting:** Consider limiting flash messages (e.g., 10 per minute per user)
- **Input validation:** Max 100 characters, sanitize content
- **Audit logging:** All messages logged with creator ID
- **No sender display:** Messages are anonymous to recipients

---

## Dependencies

No new npm packages required. Existing infrastructure is sufficient:
- `zustand` - State management (already installed)
- SSE infrastructure - Already in place
- Prisma - FlashMessage model already defined

---

## Rollout Plan

1. **Story 4.1:** Basic send/receive with database persistence
2. **Story 4.2:** Blink animations and acknowledgment
3. **Story 4.3:** Smart typing detection
4. **Story 4.4:** Message history in Flash folder
5. **Story 4.5:** Auto-return timer
6. **Story 4.6:** Performance optimization and testing

Each story builds on the previous, enabling incremental delivery and testing.

---

## References

- [PRD - FR1: Flash Message System](./PRD.md#fr1-flash-message-system)
- [Architecture - Pattern 1: Always-Visible Flash Message Bar](./architecture.md#pattern-1-always-visible-flash-message-bar)
- [Epic 4 Stories](./epics.md#epic-4-flash-message-system)

---

_This technical specification provides the blueprint for implementing Epic 4, ensuring consistent implementation across all 6 stories while maintaining alignment with the established architecture patterns._
