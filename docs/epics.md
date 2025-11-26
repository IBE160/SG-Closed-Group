# Hva Skjer - Epic Breakdown

**Author:** BIP
**Date:** 2025-11-12
**Project Level:** Level 2 (Medium - Multi-feature application)
**Target Scale:** Small team, 6-week timeline, emergency services application

---

## Overview

This document provides the complete epic and story breakdown for **Hva Skjer**, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

### Epic Summary

This breakdown organizes Hva Skjer into **5 epics** sequenced for incremental value delivery and dependency management:

1. **Epic 1: Foundation & Infrastructure** - Establish project setup, database, UI framework, and deployment
2. **Epic 2: Authentication & Access Control** - Secure application with Google OAuth and RBAC
3. **Epic 3: Event Control Dashboard** - Operational awareness (events, bilstatus, vaktplan)
4. **Epic 4: Flash Message System** - Real-time urgent dispatcher communication
5. **Epic 5: Bålmelding (Bonfire) Registration** - Automated bonfire notification with intelligent maps

**Total Stories:** ~35-40 bite-sized stories across all epics

**Timeline Alignment:**
- Week 1: Epic 1
- Week 2: Epic 2 + start Epic 3
- Week 3: Epic 3 + start Epic 4/5
- Week 4-5: Epic 4 + Epic 5 (Phase 1 & 2)
- Week 6: Polish, testing, deployment

Each story is vertically sliced, independently valuable where possible, and sized for single dev agent completion in one focused session.

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish the project foundation, core architecture, database schema, UI framework, and deployment pipeline that all subsequent features depend on.

**Value:** Creates the technical skeleton for the entire application. Without this foundation, no features can be built. Enables parallel development of features in later epics.

**Technical Scope:** Next.js 14 App Router, TypeScript, Prisma ORM, PostgreSQL, Tailwind CSS, shadcn/ui components, Vercel deployment, folder/tab navigation structure.

---

### Story 1.1: Project Initialization and Repository Setup

As a developer,
I want to initialize the Next.js 14 project with TypeScript and core dependencies,
So that I have a working development environment to build features.

**Acceptance Criteria:**

**Given** I need to start development
**When** I run the project setup
**Then** I have a Next.js 14 project with App Router, TypeScript, ESLint, and Prettier configured

**And** The project runs successfully on `localhost:3000`
**And** Git repository is initialized with proper `.gitignore`
**And** README.md contains project overview and setup instructions

**Prerequisites:** None (first story)

**Technical Notes:**
- Use `npx create-next-app@latest` with TypeScript and App Router
- Configure `.gitignore` for Node.js, Next.js, environment variables
- Install core dependencies: `react`, `next`, `typescript`, `@types/*`
- Configure `next.config.js` for production deployment
- Set up `.env.local` template for environment variables

---

### Story 1.2: Database Schema Design and Prisma Setup

As a developer,
I want to design the complete database schema and configure Prisma ORM,
So that all features have a consistent data layer.

**Acceptance Criteria:**

**Given** The project is initialized
**When** I define the Prisma schema
**Then** All tables are created: Users, Events, Flash Messages, Bilstatus, Vaktplan, Bonfire Registrations, Audit Logs

**And** Relationships between tables are properly defined with foreign keys
**And** Indexes are created for frequently queried fields (dates, status, municipality)
**And** Prisma Client is generated and ready for use
**And** Database migrations are version controlled

**Prerequisites:** Story 1.1

**Technical Notes:**
- Tables: `User`, `Event`, `FlashMessage`, `VehicleStatus`, `DutyRoster`, `BonfireRegistration`, `AuditLog`
- Use PostgreSQL (cloud-hosted initially - Vercel Postgres, Supabase, or Neon)
- Implement UUID primary keys
- Add `createdAt`, `updatedAt` timestamps
- Configure composite indexes for performance (e.g., `municipality + date + status`)
- Set up Prisma migrations: `npx prisma migrate dev`
- Reference PRD sections: Functional Requirements, Data Requirements (from proposal.md)

---

### Story 1.3: Tailwind CSS and shadcn/ui Component Library Setup

As a developer,
I want to configure Tailwind CSS and install shadcn/ui components,
So that I have a consistent, professional UI framework.

**Acceptance Criteria:**

**Given** The project has basic structure
**When** I configure Tailwind and shadcn/ui
**Then** Tailwind CSS is integrated with custom theme for emergency services aesthetic

**And** shadcn/ui CLI is configured and ready to install components
**And** Core components are installed: Button, Input, Card, Dialog, Tabs
**And** Custom color palette matches emergency services design (blues, greys, emergency red)
**And** Typography and spacing follow design system

**Prerequisites:** Story 1.1

**Technical Notes:**
- Install Tailwind CSS with PostCSS
- Configure `tailwind.config.ts` with custom theme
- Set up shadcn/ui: `npx shadcn-ui@latest init`
- Install components: `npx shadcn-ui@latest add button input card dialog tabs`
- Create custom color variables in `globals.css`
- Professional aesthetic per PRD UX Principles: high contrast, large click targets, minimal design
- Optimize for 1/4 of 49" monitor viewport (~1280x1440 or 2560x720)

---

### Story 1.4: Folder/Tab Navigation Structure

As a dispatcher,
I want to navigate between application folders using Excel-style tabs,
So that I can quickly switch between different operational views.

**Acceptance Criteria:**

**Given** I am logged into the application
**When** I view the interface
**Then** I see four tabs at the top: "Hva Skjer", "Flash", "Bålmelding", "Innstillinger"

**And** The active tab is visually highlighted
**And** Clicking a tab switches the view instantly (< 200ms)
**And** The default landing tab is "Hva Skjer"
**And** Tab state persists across page refreshes

**Prerequisites:** Story 1.1, Story 1.3

**Technical Notes:**
- Use Next.js App Router with nested routes: `/hva-skjer`, `/flash`, `/balmelding`, `/innstillinger`
- Implement tab component using shadcn/ui Tabs or custom component
- Use React Context or URL state to manage active tab
- Position tabs at very top of viewport (Excel-style)
- Style active tab distinctly (background color, border, or underline)
- Reference PRD FR8: Folder/Tab Navigation

---

### Story 1.5: "Hva Skjer" Folder Layout Structure

As a dispatcher,
I want to see the "Hva Skjer" folder with proper layout sections,
So that I have organized areas for events, bilstatus, and vaktplan.

**Acceptance Criteria:**

**Given** I navigate to the "Hva Skjer" tab
**When** The page loads
**Then** I see three distinct layout sections:
  - Left column: "Viktige meldinger" (event messages) - full height
  - Top-right: "Bilstatus" area (placeholder for S111/S112 boxes)
  - Bottom-right: "Vaktplan" area (duty roster placeholder)

**And** Layout is responsive for 1/4 of 49" monitor viewport
**And** All sections have clear visual boundaries
**And** Content areas are ready for feature implementation

**Prerequisites:** Story 1.4

**Technical Notes:**
- Use CSS Grid or Flexbox for layout: left column (60-70% width) + right column (30-40% width)
- Right column subdivided: top section (bilstatus) + bottom section (vaktplan)
- Ensure layout fits ~1280x1440 or 2560x720 viewport
- Add placeholder content to visualize sections
- Optimize for minimal scrolling (most critical data above fold)
- Reference PRD: "Hva Skjer" Layout section

---

### Story 1.6: Vercel Deployment Pipeline Configuration

As a developer,
I want to configure continuous deployment to Vercel,
So that every Git push automatically deploys to a preview or production environment.

**Acceptance Criteria:**

**Given** The codebase is in Git
**When** I push to the repository
**Then** Vercel automatically builds and deploys the application

**And** Preview deployments are created for non-main branches
**And** Production deployment occurs on merge to main branch
**And** Environment variables are configured in Vercel dashboard
**And** Build succeeds and application is accessible via HTTPS

**Prerequisites:** Story 1.1, Story 1.2

**Technical Notes:**
- Connect Git repository to Vercel project
- Configure build command: `npm run build`
- Configure environment variables in Vercel:
  - `DATABASE_URL` (Postgres connection string)
  - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_MAPS_API_KEY`
  - `AZURE_OPENAI_*` (for future bonfire system)
- Set up automatic HTTPS/SSL
- Configure custom domain (if available)
- Test deployment with a simple "Hello World" page

---

### Story 1.7: Real-Time Infrastructure Foundation (SSE/WebSocket Setup)

As a developer,
I want to establish the real-time communication infrastructure,
So that future features (flash messages, event updates) can synchronize across all dispatchers.

**Acceptance Criteria:**

**Given** Multiple dispatchers are connected
**When** One dispatcher triggers an event
**Then** All connected dispatchers receive the update in < 1 second

**And** SSE (Server-Sent Events) connection is established and maintained
**And** Automatic fallback to polling (5-second interval) if SSE fails
**And** Reconnection logic handles temporary network issues
**And** Connection status is logged for debugging

**Prerequisites:** Story 1.1, Story 1.6 (deployed environment)

**Technical Notes:**
- Implement SSE endpoint: `/api/sse` (or use WebSocket if preferred)
- Use React Context to manage real-time connection state
- Implement heartbeat/ping to detect connection drops
- Configure Vercel serverless function timeout (10 seconds max)
- Consider edge functions for lower latency
- Add connection status indicator in UI (optional for this story)
- Test with multiple browser tabs simulating 4-6 dispatchers
- Reference PRD NFR: Real-Time Synchronization, Performance (< 1 second flash delivery)

---

### Story 1.8: Audit Logging Infrastructure

As a system administrator,
I want all user actions to be automatically logged,
So that we maintain accountability and compliance for emergency operations.

**Acceptance Criteria:**

**Given** A user performs an action (create, update, delete)
**When** The action completes
**Then** An audit log entry is created with: user_id, user_email, timestamp, table_name, record_id, action_type, old_values, new_values

**And** Audit logs are tamper-proof (append-only)
**And** Logs are queryable by administrators
**And** Log entries include UTC timestamps
**And** Logging does not impact application performance

**Prerequisites:** Story 1.2 (database schema includes AuditLog table)

**Technical Notes:**
- Implement Prisma middleware for automatic audit logging
- Capture before/after values for UPDATE operations
- Store JSON snapshots in `old_values` and `new_values` JSONB fields
- Index `timestamp DESC` and `table_name` for fast queries
- Implement retention policy: 1 year for operational data, 90 days for bonfire data
- Add scheduled job for automatic cleanup (cron or Vercel Cron Jobs)
- Reference PRD FR7: Audit Logging, NFR: Security & Accountability

---

## Epic 1 Summary

**Total Stories:** 8
**Estimated Effort:** Week 1 of 6-week timeline
**Key Deliverables:**
- ✅ Working Next.js 14 project with TypeScript
- ✅ Complete database schema with Prisma ORM
- ✅ UI framework (Tailwind + shadcn/ui) configured
- ✅ Folder/tab navigation structure
- ✅ "Hva Skjer" layout ready for features
- ✅ Vercel deployment pipeline
- ✅ Real-time infrastructure (SSE/WebSocket)
- ✅ Audit logging system

**Enables:** All subsequent epic development (authentication, features)

---

## Epic 2: Authentication & Access Control

**Goal:** Secure the application with Google OAuth authentication, whitelist-based access control, and role-based permissions to meet government security and GDPR compliance requirements.

**Value:** Protects sensitive operational and citizen data. Enables secure feature development in subsequent epics. Meets regulatory requirements for emergency services applications.

**Technical Scope:** NextAuth.js v5, Google OAuth 2.0, JWT sessions, whitelist management, RBAC (Operator/Administrator), protected routes and API endpoints.

---

### Story 2.1: NextAuth.js Configuration with Google OAuth

As a developer,
I want to configure NextAuth.js with Google OAuth provider,
So that users can authenticate using their Google accounts.

**Acceptance Criteria:**

**Given** The foundation is established
**When** I configure NextAuth.js
**Then** Google OAuth 2.0 is configured as authentication provider

**And** OAuth consent screen is properly configured in Google Cloud Console
**And** Callback URLs are whitelisted for development and production
**And** NextAuth.js routes are protected with middleware
**And** Session configuration uses JWT with 8-hour expiration

**Prerequisites:** Story 1.1, Story 1.2 (User table exists), Story 1.6 (deployment)

**Technical Notes:**
- Install: `npm install next-auth@beta` (v5)
- Create `/api/auth/[...nextauth]/route.ts`
- Configure Google OAuth in Google Cloud Console
- Set environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- Configure session strategy: JWT (stateless)
- Session max age: 8 hours (28800 seconds)
- Reference PRD FR6.1: Google OAuth Login

---

### Story 2.2: User Whitelist Management System

As an administrator,
I want to manage which Google account emails can access the operator system,
So that only authorized dispatchers can use the application.

**Acceptance Criteria:**

**Given** A user attempts to log in
**When** Authentication succeeds with Google
**Then** The system checks if the user's email is in the whitelist

**And** Whitelisted users are granted access
**And** Non-whitelisted users see "Access Denied" message with contact information
**And** User record is created/updated in database on successful whitelist check
**And** Administrators can add/remove emails from whitelist via UI

**Prerequisites:** Story 2.1

**Technical Notes:**
- Add `whitelisted` boolean field to User table (already in schema from Story 1.2)
- Implement whitelist check in NextAuth callbacks
- Create `/api/admin/whitelist` endpoints (GET, POST, DELETE)
- Build admin UI for whitelist management: add email, remove email, list all
- Display clear "Access Denied" page with administrator contact info
- Log whitelist denials for security monitoring
- Reference PRD FR6.2: Whitelist-Based Access

---

### Story 2.3: Role-Based Access Control (RBAC) Implementation

As an administrator,
I want to assign roles (Operator or Administrator) to users,
So that permissions are enforced based on user responsibilities.

**Acceptance Criteria:**

**Given** A user is whitelisted
**When** The administrator assigns a role
**Then** The role is stored in the User table

**And** Operator role can: view, create, edit own content, toggle bilstatus
**And** Administrator role can: all operator permissions + delete, manage users, view audit logs
**And** Role is included in JWT session for fast authorization checks
**And** API endpoints enforce role-based permissions server-side

**Prerequisites:** Story 2.2

**Technical Notes:**
- Add `role` enum field to User table: `OPERATOR`, `ADMINISTRATOR`
- Include role in NextAuth session object
- Create authorization middleware: `requireRole(['OPERATOR', 'ADMINISTRATOR'])`
- Protect API routes with role checks (return 403 Forbidden if unauthorized)
- Hide admin-only UI features from operators (client-side)
- Always enforce permissions server-side (don't rely on UI hiding)
- Reference PRD FR6.3: Role-Based Permissions

---

### Story 2.4: Protected Routes and API Endpoints

As a developer,
I want all application routes and API endpoints to be protected,
So that only authenticated users can access the system.

**Acceptance Criteria:**

**Given** An unauthenticated user attempts to access the application
**When** They navigate to any protected route
**Then** They are redirected to the login page

**And** After successful authentication, they are redirected to their intended destination
**And** All API endpoints require valid session (except public bonfire registration in future)
**And** Invalid/expired sessions return 401 Unauthorized
**And** Middleware protects all routes except `/api/auth/*` and public pages

**Prerequisites:** Story 2.1

**Technical Notes:**
- Create Next.js middleware in `middleware.ts`
- Protect all routes except: `/api/auth/*`, `/login`
- Check session in middleware using `getToken()` from next-auth/jwt
- Redirect unauthenticated users to `/login`
- Store intended destination in session for post-login redirect
- Protect API routes with session validation helper
- Test with expired sessions and invalid tokens

---

### Story 2.5: Login Page and User Profile UI

As a dispatcher,
I want a professional login page and user profile display,
So that I can authenticate and see my account information.

**Acceptance Criteria:**

**Given** I navigate to the application
**When** I am not authenticated
**Then** I see a professional login page with "Sign in with Google" button

**And** Clicking the button redirects to Google OAuth consent screen
**And** After authorization, I am redirected to the application
**And** I see my name and email in the UI header/nav
**And** I can log out with a clearly visible logout button
**And** Login page matches emergency services aesthetic

**Prerequisites:** Story 2.1, Story 1.3 (UI framework)

**Technical Notes:**
- Create `/login` page with shadcn/ui Button component
- Use NextAuth `signIn('google')` for authentication
- Display user info in navigation: name, email, role
- Implement logout button using `signOut()`
- Style login page professionally (emergency services aesthetic)
- Add application branding/logo
- Test full authentication flow end-to-end

---

### Story 2.6: Session Management and Security Hardening

As a security-conscious administrator,
I want sessions to be secure with proper expiration and token verification,
So that unauthorized access is prevented.

**Acceptance Criteria:**

**Given** A user is authenticated
**When** Their session is active
**Then** JWT tokens are verified on every request using Google public keys

**And** Sessions expire after 8 hours of inactivity
**And** Expired sessions are automatically cleared
**And** Session tokens are httpOnly and sameSite cookies (CSRF protection)
**And** Token refresh happens automatically before expiration
**And** Security headers are configured (CSP, HSTS, etc.)

**Prerequisites:** Story 2.1

**Technical Notes:**
- Configure NextAuth session: `maxAge: 28800` (8 hours)
- Enable automatic token refresh with `updateAge`
- Configure cookie settings: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` (production)
- Implement token verification using Google's public keys
- Add security headers in `next.config.js`:
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
- Test session expiration and automatic logout
- Reference PRD NFR: Security (Authentication Security, CSRF protection)

---

## Epic 2 Summary

**Total Stories:** 6
**Estimated Effort:** Week 2 of 6-week timeline
**Key Deliverables:**
- ✅ Google OAuth 2.0 authentication working
- ✅ Whitelist management system for access control
- ✅ Role-based permissions (Operator/Administrator)
- ✅ All routes and API endpoints protected
- ✅ Professional login page and user profile UI
- ✅ Secure session management with 8-hour expiration

**Enables:** Secure development of all feature epics (3, 4, 5)

---

## Epic 3: Event Control Dashboard

**Goal:** Provide dispatchers with real-time operational awareness through event management, vehicle rotation tracking (bilstatus), and duty roster display.

**Value:** Delivers immediate operational value. Replaces informal communication with structured event tracking. Enables workload balancing through vehicle rotation system. Establishes real-time sync patterns for later epics.

**Technical Scope:** Event CRUD operations, two-priority system (Pri 1/Normal), bilstatus (S111/S112 vehicle status), vaktplan (duty roster), real-time updates via SSE.

---

### Story 3.1: Event Management - Create and List Events

As a dispatcher,
I want to create operational events and see them in a list,
So that all dispatchers are aware of important information.

**Acceptance Criteria:**

**Given** I am in the "Hva Skjer" folder
**When** I create a new event with title, description, and priority
**Then** The event appears in the "Viktige meldinger" list immediately

**And** All connected dispatchers see the new event in real-time (< 2 seconds)
**And** Events are sorted with Pri 1 (Red) at the top, then by timestamp
**And** Event creation is audit-logged with creator's user_id and timestamp
**And** Empty state message shows when no events exist

**Prerequisites:** Story 1.5 (layout), Story 1.7 (real-time), Story 2.1+ (auth)

**Technical Notes:**
- Create `/api/events` POST endpoint
- Use Event table from Story 1.2 schema
- Fields: title (max 50 chars), description (max 200 chars), priority (CRITICAL/NORMAL), status (ACTIVE)
- Broadcast new event via SSE to all connected dispatchers
- Use shadcn/ui Dialog for create form
- Validate required fields server-side and client-side
- Reference PRD FR2.1: Event Management

---

### Story 3.2: Event Management - Edit and Delete Events

As a dispatcher,
I want to edit or delete existing events,
So that information stays current and accurate.

**Acceptance Criteria:**

**Given** An event exists in the list
**When** I click edit and modify the event
**Then** Changes are saved and broadcast to all dispatchers in real-time

**And** When I delete an event, it is archived (soft delete) and removed from view
**And** All operators can edit/delete any event (collaborative model)
**And** Edit/delete actions are audit-logged
**And** Optimistic UI updates provide immediate feedback

**Prerequisites:** Story 3.1

**Technical Notes:**
- Create `/api/events/[id]` PATCH and DELETE endpoints
- Soft delete: set `deletedAt` timestamp and `deletedBy` user_id
- Broadcast updates via SSE: `{ type: 'EVENT_UPDATED/EVENT_DELETED', payload: {...} }`
- Use shadcn/ui Dialog for edit form (prefilled with existing values)
- Add confirmation dialog for delete action
- Reference PRD FR2.1: Event Management

---

### Story 3.3: Priority System and Filtering

As a dispatcher,
I want to mark events as Pri 1 (Critical) and filter by priority,
So that urgent information stands out visually.

**Acceptance Criteria:**

**Given** Events exist with different priorities
**When** I view the event list
**Then** Pri 1 events are highlighted in red and displayed at the top

**And** Normal events are displayed with standard styling below Pri 1 events
**And** I can toggle filter to show "All Events" or "Pri 1 Only"
**And** Filter state persists per user session
**And** Color-coding is accessible (meets WCAG contrast requirements)

**Prerequisites:** Story 3.1

**Technical Notes:**
- Priority enum: `CRITICAL` (Pri 1), `NORMAL`
- CSS classes: `.priority-critical` (red background/text), `.priority-normal` (default)
- Filter implemented client-side (toggle button or dropdown)
- Sort logic: priority DESC, then createdAt DESC
- Use localStorage or React state for filter preference
- Reference PRD FR2.2: Priority System

---

### Story 3.4: Bilstatus (Vehicle Rotation) - Status Display and Toggle

As a dispatcher,
I want to see S111 and S112 truck status and toggle between them,
So that workload is balanced between vehicles.

**Acceptance Criteria:**

**Given** I view the "Hva Skjer" folder
**When** I look at the top-right Bilstatus section
**Then** I see two prominent boxes for S111 and S112

**And** Each box shows current status: Green (ready), Red (out), or Grey (out of service)
**And** Clicking a green truck toggles it to red and the paired truck to green automatically
**And** Status changes broadcast to all dispatchers in < 1 second
**And** System enforces mutual exclusivity: only one truck green at a time (if neither grey)

**Prerequisites:** Story 1.5 (layout), Story 1.7 (real-time), Story 2.1+ (auth)

**Technical Notes:**
- Create VehicleStatus table records for S111 and S112 (seed in migration)
- Create `/api/bilstatus` GET and PATCH endpoints
- Status enum: `READY` (green), `OUT` (red), `OUT_OF_SERVICE` (grey)
- Toggle logic: If S111 clicked and is green, set S111=RED and S112=GREEN (vice versa)
- Broadcast via SSE: `{ type: 'BILSTATUS_UPDATED', payload: {...} }`
- Large clickable boxes (~150x150px) with color-coded backgrounds
- Reference PRD FR3.1, FR3.2: Bilstatus Display and Rotation Logic

---

### Story 3.5: Bilstatus - Grey Status with Notes

As a dispatcher,
I want to set a truck to grey (out of service) with a reason note,
So that everyone knows why the vehicle is unavailable.

**Acceptance Criteria:**

**Given** I right-click on a bilstatus box
**When** I select "Set to Grey" from context menu
**Then** A dialog appears prompting for a reason note (required)

**And** After entering note, the truck turns grey and displays the note
**And** The paired truck automatically becomes green (ready)
**And** I can edit the note by right-clicking grey box again
**And** I can cancel grey status, returning trucks to red/green rotation

**Prerequisites:** Story 3.4

**Technical Notes:**
- Add `note` field to VehicleStatus table (nullable, max 50 chars)
- Implement context menu using HTML `<menu>` or custom component
- Use shadcn/ui Dialog for note input
- Enforce business rule: If one truck grey → other MUST be green
- Store note in database and display in box
- Enable note editing when in grey state
- Reference PRD FR3.3: Grey Status with Notes

---

### Story 3.6: Vaktplan (Duty Roster) Display

As a dispatcher,
I want to see the current week's duty roster,
So that I know who is assigned to key positions.

**Acceptance Criteria:**

**Given** I view the "Hva Skjer" folder
**When** I look at the bottom-right Vaktplan section
**Then** I see the current week's duty assignments

**And** Key positions are listed: vakthavende brannsjef, innsatsleder brann, etc.
**And** Assigned person name is displayed for each position
**And** Current week is auto-detected from system date
**And** Display fits in allocated bottom-right layout space

**Prerequisites:** Story 1.5 (layout), Story 2.1+ (auth)

**Technical Notes:**
- Create `/api/vaktplan` GET endpoint
- Use DutyRoster table from Story 1.2 schema
- Query by current week number and year: `WHERE weekNumber = ? AND year = ?`
- Calculate week number using date library (date-fns or Day.js)
- Display as simple list or table: Position | Assigned Person
- Read-only view for operators (editing in Story 3.7)
- Reference PRD FR4.1: Weekly Overview

---

### Story 3.7: Vaktplan - Administrator Editing

As an administrator,
I want to update duty roster assignments for current and future weeks,
So that the roster stays current.

**Acceptance Criteria:**

**Given** I am an administrator viewing vaktplan
**When** I click "Edit Roster"
**Then** I can modify assigned persons for each position

**And** I can navigate to future weeks to pre-assign duties
**And** Changes are saved and visible to all dispatchers immediately
**And** Only administrators can edit (operators see read-only view)
**And** Edit actions are audit-logged

**Prerequisites:** Story 3.6, Story 2.3 (RBAC)

**Technical Notes:**
- Create `/api/vaktplan` POST/PATCH endpoints
- Protect with `requireRole(['ADMINISTRATOR'])`
- Implement week navigation: Previous Week / Next Week buttons
- Use shadcn/ui Form with Input fields for each position
- Broadcast updates via SSE (optional - vaktplan changes less frequently than events)
- Show edit mode only to administrators based on session role
- Reference PRD FR4.2: Roster Updates

---

## Epic 3 Summary

**Total Stories:** 7
**Estimated Effort:** Week 2 (partial) + Week 3 of 6-week timeline
**Key Deliverables:**
- ✅ Event management (create, edit, delete, list)
- ✅ Two-priority system (Pri 1 Red + Normal)
- ✅ Real-time event synchronization across dispatchers
- ✅ Bilstatus vehicle rotation system (S111/S112)
- ✅ Grey status with reason notes
- ✅ Vaktplan duty roster display and editing
- ✅ Full audit logging for all actions

**Enables:** Real-time operational awareness, vehicle workload balancing, and established sync patterns for Epic 4

---

## Epic 4: Flash Message System

**Goal:** Enable instant, urgent dispatcher-to-dispatcher communication with two-key shortcut, blink animations, smart typing detection, and sub-second delivery.

**Value:** Replaces informal communication (phone, shouting) with fast, auditable system. Critical for emergency coordination ("Stand by", "All clear", "Trenger BAPS"). Every feature optimized for seconds saved.

**Technical Scope:** Keyboard shortcuts, WebSocket/SSE real-time broadcast, blink animations, smart typing detection, auto-switch logic, message history, < 1 second delivery.

---

### Story 4.1: Flash Message Basic Send and Receive

As a dispatcher,
I want to send a short flash message that all dispatchers see instantly,
So that I can communicate urgent information during emergencies.

**Acceptance Criteria:**

**Given** I am in any folder
**When** I press the two-key shortcut (e.g., Ctrl+Shift+F)
**Then** A message input appears

**And** I type a short message (1-50 characters) and press Enter
**And** The message broadcasts to all connected dispatchers in < 1 second
**And** All dispatchers see the message in a dedicated message field at top of screen
**And** Message includes automatic timestamp (no sender identification per PRD)

**Prerequisites:** Story 1.7 (real-time), Story 2.1+ (auth)

**Technical Notes:**
- Create `/api/flash` POST endpoint
- Use FlashMessage table from Story 1.2 schema
- Broadcast via WebSocket/SSE: `{ type: 'FLASH_MESSAGE', payload: {...} }`
- Message field persistent at top of viewport across all folders
- Keyboard shortcut using `addEventListener('keydown')` with Ctrl+Shift+F
- Input modal/dialog appears on shortcut, auto-focuses text field
- Validate message length (1-100 chars hard limit)
- Reference PRD FR1.1: Message Creation

---

### Story 4.2: Blink Animation and Acknowledgment

As a dispatcher,
I want flash messages to blink prominently to grab attention,
So that I notice urgent messages even when focused elsewhere.

**Acceptance Criteria:**

**Given** A flash message arrives
**When** I receive it
**Then** The entire application blinks 3 times quickly (0.2s on, 0.2s off, 0.2s on)

**And** The message line blinks continuously (1s on, 1s off) until I acknowledge
**And** Clicking the message stops blinking and marks it as read
**And** Visual indicator shows unread message count if multiple messages exist
**And** Blink animation works reliably in Edge and Chrome

**Prerequisites:** Story 4.1

**Technical Notes:**
- CSS animations for blink effect: `@keyframes blink`
- Quick blink: 3 cycles at 200ms intervals (total 1.2 seconds)
- Continuous blink: 1s on, 1s off loop
- Use React state to control blink active/stopped
- Click handler stops animation and marks message as acknowledged
- Store acknowledged status per user in database or local state
- Reference PRD FR1.2: Message Display

---

### Story 4.3: Smart Typing Detection and Auto-Switch

As a dispatcher,
I want the system to avoid auto-switching me to Flash folder if I'm typing,
So that I'm not interrupted during critical documentation.

**Acceptance Criteria:**

**Given** A flash message arrives
**When** I am actively typing (keyboard activity in last 3 seconds)
**Then** The Flash tab blinks instead of auto-switching me

**And** If I'm NOT typing, the system auto-switches me to Flash folder immediately
**And** Typing detection has > 95% accuracy
**And** Manual tab switching always overrides auto-switch

**Prerequisites:** Story 4.1, Story 1.4 (tab navigation)

**Technical Notes:**
- Implement typing detection: track last keypress timestamp
- If `Date.now() - lastKeypressTimestamp < 3000ms` → user is typing
- If typing: blink Flash tab border/background, don't auto-switch
- If not typing: programmatically switch to Flash folder
- Use React Context to share typing state across components
- Test with multiple scenarios: typing in form, idle, reading
- Reference PRD FR1.3: Smart Auto-Switch, Innovation: Smart Typing Detection

---

### Story 4.4: Message History and Multiple Messages

As a dispatcher,
I want to see recent flash messages and navigate between them,
So that I don't miss information if multiple messages arrive quickly.

**Acceptance Criteria:**

**Given** Multiple flash messages have been sent
**When** I view the Flash folder
**Then** I see the 3 most recent messages displayed

**And** I can scroll/paginate to view older messages
**And** Newest message is always displayed first
**And** Unread messages are visually distinguished from read messages
**And** Messages persist for 24 hours, then auto-archive

**Prerequisites:** Story 4.1

**Technical Notes:**
- Display messages in Flash folder: newest first (ORDER BY createdAt DESC)
- Limit initial display to 3 messages, add "Load More" or infinite scroll
- Mark messages as read when clicked or viewed in Flash folder
- Auto-archive: scheduled job deletes messages > 24 hours old
- Use different styling for unread (bold/highlighted) vs read
- Reference PRD FR1.4: Message History

---

### Story 4.5: Auto-Return Timer and Flash Folder UI

As a dispatcher,
I want to automatically return to "Hva Skjer" after 5 minutes in Flash folder,
So that I don't forget to monitor operational events.

**Acceptance Criteria:**

**Given** I am in the Flash folder
**When** 5 minutes pass with no user interaction
**Then** I am automatically switched back to "Hva Skjer" folder

**And** Timer resets if I interact with the application (click, type, navigate)
**And** Manual tab switching cancels the timer
**And** Flash folder displays both read interface and write interface

**Prerequisites:** Story 4.1, Story 1.4 (navigation)

**Technical Notes:**
- Implement 5-minute idle timer using `setTimeout`
- Reset timer on any user interaction: `onClick`, `onKeyPress`, `onFocus`
- Clear timer if user manually switches folders
- Flash folder layout: top section (write new message), bottom section (message history)
- Use React `useEffect` with cleanup for timer management
- Reference PRD FR8.2: Default & Auto-Switch Behavior

---

### Story 4.6: Flash Message Performance Optimization

As a developer,
I want flash messages to deliver in < 1 second across all dispatchers,
So that urgent communication is truly instant.

**Acceptance Criteria:**

**Given** A dispatcher sends a flash message
**When** The message is broadcast
**Then** All 4-6 connected dispatchers receive it in < 1 second (avg < 800ms)

**And** Performance is tested with realistic network conditions
**And** Message delivery is reliable (no lost messages)
**And** System handles 10-30 messages per shift without degradation
**And** Vercel edge functions or optimized routes are used for low latency

**Prerequisites:** Story 4.1, Story 1.7 (real-time)

**Technical Notes:**
- Optimize WebSocket/SSE connection for low latency
- Use Vercel Edge Functions if applicable (closer to users)
- Test with multiple browser tabs simulating 4-6 dispatchers
- Measure round-trip time: send → broadcast → receive → display
- Implement message queue if needed for reliability
- Add connection status indicator (optional)
- Reference PRD NFR: Performance (< 1 second flash delivery)

---

## Epic 4 Summary

**Total Stories:** 6
**Estimated Effort:** Week 3-4 of 6-week timeline
**Key Deliverables:**
- ✅ Two-key keyboard shortcut (Ctrl+Shift+F)
- ✅ Instant broadcast to all dispatchers (< 1 second)
- ✅ Attention-grabbing blink animations (3 quick + continuous)
- ✅ Smart typing detection (context-aware auto-switch)
- ✅ Message history and multi-message handling
- ✅ Auto-return timer (5 minutes)
- ✅ Performance optimized for emergency response

**Enables:** Fast, auditable dispatcher-to-dispatcher communication during emergencies

---

## Epic 5: Bålmelding (Bonfire) Registration System

**Goal:** Automate bonfire notification processing with Azure OpenAI extraction and Google Maps integration, reducing fire verification from minutes to < 10 seconds.

**Value:** Eliminates manual email review of 29 municipal folders. Enables instant map-based fire verification. Two-phase approach (manual pilot → full automation) reduces risk.

**Technical Scope:** Azure OpenAI email parsing, Power Automate integration, Google Maps API (geocoding, POI, autocomplete), municipality filtering, automatic expiration.

> **Architecture Update (ADR-006):** Epic 5 uses **Azure Table Storage** instead of PostgreSQL/Prisma for bonfire data storage. This was decided to enable parallel development by team members and leverage Azure Student subscription. See [architecture.md](./architecture.md#adr-006-hybrid-database-architecture-postgresql--azure-table-storage) for full rationale. Authentication still uses NextAuth.js with Google OAuth from Epic 2.

---

### Story 5.1: Google Maps Integration and Map Display

As a dispatcher,
I want to see an interactive Google Map with bonfire POI markers,
So that I can quickly verify if a reported fire is a registered bonfire.

**Acceptance Criteria:**

**Given** Bonfire registrations exist in database
**When** I navigate to Bålmelding folder
**Then** I see an interactive Google Map centered on the region

**And** Registered bonfires are displayed as POI markers
**And** Clicking a marker shows contact details (name, phone, address, bonfire size, date/time)
**And** Map supports zoom, pan, and standard Google Maps interactions
**And** Map loads in < 2 seconds

**Prerequisites:** Story 1.4 (navigation), Story 2.1+ (auth)

**Technical Notes:**
- Install: `npm install @vis.gl/react-google-maps`
- Create `/balmelding` page with Google Maps component
- Configure Google Maps API key in environment variables
- Create `/api/bonfires` GET endpoint (returns all active bonfires from Azure Table Storage)
- Use `lib/azure-table.ts` for Azure Table Storage operations
- Render markers for each bonfire with lat/lng from Azure Table
- Info window displays: name, phone, address, size, date/time, notes
- Center map on region (Rogaland, Norway coordinates)
- Reference PRD FR5.3: Google Maps Integration
- **Storage:** Azure Table Storage (see ADR-006)

---

### Story 5.2: Manual Bonfire Registration (Baseline)

As a dispatcher,
I want to manually create bonfire registrations from email content,
So that we have a baseline system before automation.

**Acceptance Criteria:**

**Given** I receive a bonfire notification email
**When** I click "Add Bonfire" in Bålmelding folder
**Then** A form appears to enter bonfire details manually

**And** Required fields: name, phone, address, municipality, bonfire size, date/time
**And** Address field uses Google Places Autocomplete for easy entry
**And** Submitting form geocodes address to lat/lng automatically
**And** New bonfire appears on map immediately for all dispatchers

**Prerequisites:** Story 5.1

**Technical Notes:**
- Create `/api/bonfires` POST endpoint
- Use shadcn/ui Form with validation (React Hook Form + Zod)
- Integrate Google Places Autocomplete for address field
- Call Google Geocoding API on form submit to get lat/lng
- Store bonfire in Azure Table Storage via `lib/azure-table.ts`
- Broadcast new bonfire via SSE/WebSocket to update all maps
- Municipality dropdown: 29 municipalities (populate from config)
- Reference PRD FR5.1: Phase 1 (baseline before AI)
- **Storage:** Azure Table Storage (see ADR-006)

---

### Story 5.3: Azure OpenAI Email Parsing (Phase 1 - Manual Pilot)

As a dispatcher,
I want to paste email content into a chatbot that extracts bonfire data,
So that I don't have to manually type every field.

**Acceptance Criteria:**

**Given** I have bonfire email content
**When** I paste it into the Azure OpenAI chatbot interface
**Then** AI extracts: name, phone, address, bonfire size, date/time, notes, municipality

**And** Extracted data is displayed for my review and editing
**And** I can approve or modify the data before creating POI
**And** AI extraction accuracy is > 90% for complete emails
**And** Incomplete extractions are flagged for manual completion

**Prerequisites:** Story 5.2

**Technical Notes:**
- Create `/api/ai/extract-bonfire` POST endpoint
- Integrate Azure OpenAI API (GPT-4 or GPT-3.5)
- Prompt engineering: extract structured data from Norwegian text
- Return JSON: `{ name, phone, address, municipality, size, date_from, date_to, notes, confidence }`
- Flag low-confidence extractions (< 0.8) for manual review
- Display extracted data in editable form before saving
- Test with real email samples for accuracy
- Reference PRD FR5.1: Phase 1 Manual Chatbot Pilot

---

### Story 5.4: Power Automate Integration (Phase 2 - Email Monitoring)

As an administrator,
I want Power Automate to monitor the shared mailbox and trigger bonfire processing,
So that registrations are processed automatically without dispatcher intervention.

**Acceptance Criteria:**

**Given** Power Automate flow is configured
**When** A bonfire registration email arrives in any of 29 municipal folders
**Then** Power Automate extracts email body and metadata

**And** Flow calls the application API endpoint with email content
**And** Application processes email (AI extraction → validation → POI creation)
**And** Complete registrations auto-create POI without manual approval
**And** Incomplete registrations are flagged for dispatcher review queue

**Prerequisites:** Story 5.3

**Technical Notes:**
- Create Power Automate flow: Email trigger → HTTP POST to `/api/bonfires/auto-process`
- Endpoint receives: email body, subject, sender, municipality folder
- Call Azure OpenAI for extraction
- Validate extraction completeness (all required fields present)
- If complete AND high confidence (> 95%) → auto-create bonfire + POI
- If incomplete OR low confidence → add to manual review queue
- Create `/api/bonfires/review-queue` endpoint for flagged registrations
- Reference PRD FR5.2: Phase 2 Full Automation

---

### Story 5.5: Municipality Filtering and Search

As a dispatcher,
I want to filter bonfires by municipality and search by address,
So that I can quickly find relevant registrations for a specific area.

**Acceptance Criteria:**

**Given** Multiple bonfires exist across 29 municipalities
**When** I select a municipality from the filter dropdown
**Then** The map shows only bonfires for that municipality

**And** I can search by address or name to find specific bonfires
**And** Search results highlight matching markers on the map
**And** Filter state persists during my session
**And** "Show All" option clears filters

**Prerequisites:** Story 5.1

**Technical Notes:**
- Add municipality dropdown (29 options) above map
- Implement client-side filtering of markers based on selected municipality
- Add search input field with autocomplete/suggestions
- Filter markers by search query (match address or registrant name)
- Use React state to manage active filters
- Highlight/zoom to search results
- Reference PRD FR5.3: Municipality Filter, Search Functionality

---

### Story 5.6: Automatic Bonfire Expiration

As a system administrator,
I want bonfires to automatically expire and be removed from the map,
So that dispatchers only see current registrations.

**Acceptance Criteria:**

**Given** A bonfire registration has passed its date_to field
**When** The scheduled cleanup job runs (daily)
**Then** Expired bonfires are removed from the map

**And** Expired data is retained for 90 days before permanent deletion (GDPR)
**And** Expiration process runs automatically without manual intervention
**And** Audit logs track expiration and deletion actions

**Prerequisites:** Story 5.1, Story 5.2

**Technical Notes:**
- Create `/api/cron/expire-bonfires` endpoint (protected)
- Schedule with Vercel Cron Jobs or similar: daily at 2 AM
- Query: `WHERE date_to < NOW() AND status = 'ACTIVE'`
- Set status to 'EXPIRED' (soft delete)
- After 90 days: permanent deletion (GDPR compliance)
- Audit log all expirations and deletions
- Broadcast map updates to remove expired markers
- Reference PRD FR5.4: Automatic Expiration, NFR: GDPR Compliance

---

### Story 5.7: Manual Review Queue for Flagged Registrations

As a dispatcher,
I want to see and process bonfire registrations flagged by AI as incomplete,
So that all registrations are handled even if automation fails.

**Acceptance Criteria:**

**Given** Some bonfire registrations are flagged for manual review
**When** I view the review queue
**Then** I see a list of flagged registrations with extracted data and confidence scores

**And** I can edit and complete missing fields
**And** I can approve registration to create POI
**And** I can reject registration if it's spam/invalid
**And** Review queue is accessible only to authenticated dispatchers

**Prerequisites:** Story 5.4

**Technical Notes:**
- Create `/api/bonfires/review-queue` GET endpoint
- Add "Review Queue" section in Bålmelding folder
- Display table/list: registration ID, extracted data, confidence, flagged fields
- Provide edit form for each flagged registration
- Actions: Approve (create POI), Edit & Approve, Reject (mark as invalid)
- Filter queue: show only pending reviews
- Reference PRD FR5.2: Manual Review Queue

---

## Epic 5 Summary

**Total Stories:** 7
**Estimated Effort:** Week 4-5 of 6-week timeline
**Key Deliverables:**
- ✅ Google Maps integration with bonfire POI markers
- ✅ Manual bonfire registration (baseline)
- ✅ Azure OpenAI email parsing (Phase 1: manual chatbot pilot)
- ✅ Power Automate email monitoring (Phase 2: full automation)
- ✅ Municipality filtering (29 municipalities) and search
- ✅ Automatic bonfire expiration (GDPR compliance)
- ✅ Manual review queue for flagged registrations

**Enables:** Instant fire verification (< 10 seconds vs. minutes), eliminates manual email review, 80%+ time savings

---

## Final Summary

**Total Epics:** 5
**Total Stories:** 34 stories across all epics

**Epic Breakdown:**
- Epic 1: Foundation & Infrastructure - 8 stories
- Epic 2: Authentication & Access Control - 6 stories
- Epic 3: Event Control Dashboard - 7 stories
- Epic 4: Flash Message System - 6 stories
- Epic 5: Bålmelding (Bonfire) System - 7 stories

**Timeline:**
- Week 1: Epic 1 (Foundation)
- Week 2: Epic 2 (Auth) + start Epic 3
- Week 3: Epic 3 (Event Control) + start Epic 4
- Week 4: Epic 4 (Flash Messages) + Epic 5 Phase 1
- Week 5: Epic 5 Phase 2 (Full Automation) + polish
- Week 6: Testing, bug fixes, deployment

**All stories are:**
- ✅ Vertically sliced (deliver complete functionality)
- ✅ Sized for single dev agent completion
- ✅ Sequentially ordered (no forward dependencies)
- ✅ Written in BDD format with clear acceptance criteria
- ✅ Traceable to PRD requirements

---

_Ready for implementation: Use `create-story` workflow to generate individual story implementation plans._

_Reference: [PRD.md](./PRD.md) for detailed requirements._
