# Hva Skjer - Product Requirements Document

**Author:** BIP
**Date:** 2025-11-12
**Version:** 1.0

---

## Executive Summary

Hva Skjer is an emergency response registration and coordination application that restores critical capabilities lost during system upgrades at 110 Sør-Vest emergency response center. The application fills operational gaps that directly impact emergency response efficiency and safety by providing three essential functions: rapid flash messaging between dispatchers, centralized event control dashboard, and automated bonfire notification system with intelligent map integration.

This system addresses a real operational crisis - emergency response teams currently lack the tools they relied on for years, forcing workarounds that create inefficiencies and potential safety risks during critical operations. Hva Skjer brings these capabilities back while modernizing them with intelligent automation and real-time coordination features.

### What Makes This Special

**The magic of Hva Skjer lies in its ruthless focus on seconds saved during emergencies.**

Every feature is designed for speed in high-pressure situations:
- **Two-key shortcut** for flash messages - no menus, no clicking, just instant communication
- **Instant map-based fire verification** - replacing minutes of email searching with a single glance at a map
- **Always-visible event dashboard** - critical operational awareness without context switching
- **Intelligent automation** - Azure OpenAI eliminates manual email processing of 29 municipal folders

This isn't just a replacement system - it's an upgrade that respects the chaos and urgency of emergency response work. The application stays out of the way until it's needed, then delivers information instantly when seconds matter most.

---

## Project Classification

**Technical Type:** Web Application (SaaS B2B)
**Domain:** Emergency Services / GovTech
**Complexity:** High

This is a **real-time operational support system** for a 24/7 emergency response center handling 25,000+ incidents annually across 29 municipalities. The system must support high-pressure emergency workflows where delays measured in seconds can impact safety outcomes.

### Domain Context

**Emergency Response Center Environment:**
- 24/7 operations with 3-5 dispatchers per 12-hour shift
- Multi-screen workstations (three 49" monitors per operator)
- Application occupies 1/4 of one monitor (~1280x1440 or 2560x720 viewport)
- High-stress environment where operators handle life-threatening emergencies
- Every interaction must be optimized for speed - seconds matter
- No tolerance for system downtime during critical operations

**Regulatory & Operational Constraints:**
- Government-grade security compliance required (Azure OpenAI with government security)
- GDPR compliance for citizen personal information
- Audit trail requirements for accountability
- Cannot integrate with primary Locus Emergency Operation System (API access denied)
- Must operate completely independently without IT department assistance
- Data retention: 1 year for operational data, 90 days for bonfire registrations

**Critical Success Factor:**
System must function flawlessly during emergencies - operator trust depends on zero failures when it matters most.

---

## Success Criteria

### Primary Success Metrics

**Operational Adoption:**
- Dispatchers actively use all three features during regular operations
- Flash messages become primary method for urgent dispatcher-to-dispatcher communication
- Event control dashboard becomes authoritative source for operational awareness
- Bonfire verification happens via map check instead of email folder review

**Performance Targets:**
- Flash messages deliver to all dispatcher screens in < 1 second
- Bonfire verification time reduced from several minutes (email search) to < 10 seconds (map glance)
- Event control dashboard updates visible to all users in real-time
- System achieves 80%+ reduction in bonfire-related email review time

**Reliability:**
- Zero manual email folder reviews needed during peak bonfire season
- System functions without critical failures during 2-week testing period
- No missed flash messages during testing phase
- All bonfire registrations process and appear as Google Maps POI automatically

### User Experience Success

**Dispatcher Satisfaction:**
- Application feels like native desktop tool, not web app
- Zero training documentation needed for basic operation
- Operators choose to use flash messages over alternative methods (phone, shouting)
- System integrates seamlessly into existing multi-screen workflow
- No complaints about UI friction or unnecessary clicks

**Citizen Experience (Bonfire Registration):**
- 85%+ bonfire registration form completion rate
- Address autocomplete reduces data entry errors
- Registration confirmation visible immediately
- No follow-up phone calls needed for clarification

### Business Impact

**Operational Efficiency:**
- Eliminated: Manual review of 29 municipal email folders
- Eliminated: Time spent searching email for bonfire information during fire calls
- Eliminated: Informal communication channels with no audit trail
- Gained: Real-time situational awareness across all dispatchers
- Gained: Comprehensive audit trail for compliance and training

**Safety & Risk Mitigation:**
- Faster fire verification reduces unnecessary emergency vehicle dispatch
- Improved dispatcher coordination during complex emergencies
- Better vehicle workload balancing (S111/S112 rotation tracking)
- Reduced risk of missed critical operational information

---

## Product Scope

### MVP - Minimum Viable Product

All three core capabilities must be fully functional in MVP - this is a complete system, not a phased rollout.

#### 1. Flash Message System (COMPLETE)

**Core Functionality:**
- Two-key keyboard shortcut triggers message input
- Text input for short messages (1-50 characters recommended, typically 1 sentence)
- Instant broadcast to all connected dispatcher screens simultaneously
- Prominent visual display with attention-grabbing blink sequence
- Message dismissal capability
- Message history (scroll/paginate through recent messages)
- Persistent WebSocket/SSE connection for real-time delivery

**Visual Behavior:**
- Dedicated message field at top of screen
- 3 quick blinks of entire application (attention grab)
- Continuous blinking of message line until acknowledged
- Click to stop blinking and read message
- Newest message displayed first
- Visual indicator when multiple unread messages exist

**Smart Interaction:**
- Auto-switch all operators to Flash folder when message sent
- UNLESS operator is actively typing - then Flash tab blinks instead (smart typing detection)
- Auto-return to "Hva Skjer" folder after 5 minutes of inactivity
- No sender identification (anonymous broadcast to all dispatchers)
- No reply function - write new message instead

**Example Use Cases:**
- "Trenger BAPS" (backup request)
- "Pause om 5 min" (break coordination)
- "S111 ute av drift" (vehicle status alert)
- "Stand by" / "All clear" (emergency coordination)

#### 2. Event Control Dashboard (COMPLETE)

**Event Management:**
- Create operational events (road closures, drills, incidents, gas flaring, smoke tests)
- Event fields: Title, description, priority, timestamp
- Real-time event list visible to all dispatchers
- Update event status (active/resolved)
- Delete/archive completed events
- Persistent display of active events
- Two-priority system: Pri 1 (Red/Critical) + Normal

**Vehicle/Truck Rotation System (Bilstatus):**
- Visual status boxes for fire trucks (S111, S112)
- Color-coded status indicators:
  - **Green**: Ready/available for next assignment (only one truck green at a time)
  - **Red**: Just responded/out on assignment (paired truck)
  - **Grey**: Out of service with reason note (maintenance, training, etc.)
- Click to toggle status between trucks (S111 goes green → S112 becomes red automatically)
- Right-click to set grey status and add note
- Short text field in each box for reason/notes
- System enforces rotation: Only one truck in a pair can be green at a time
- Real-time sync: All dispatchers see current status instantly
- All operators can read and edit (not safety-critical, workload balancing only)

**Vaktplan (Duty Roster):**
- Weekly overview of key personnel assignments
- Display assigned personnel for positions (vakthavende brannsjef, innsatsleder brann, etc.)
- Located below bilstatus in top-right of "Hva Skjer" folder

#### 3. Bålmelding (Bonfire) Registration System (COMPLETE - FULL AUTOMATION)

**Two-Phase Implementation:**

**Phase 1 - Manual Pilot (Week 2-3):**
- Azure OpenAI chatbot interface for dispatchers
- Copy-paste email content from municipal folders
- AI extracts structured data (name, phone, address, bonfire size, date/time, notes)
- Creates Google Maps POI with extracted information
- Manual validation and approval workflow

**Phase 2 - Full Automation (Week 3-4):**
- Power Automate monitors shared mailbox (29 municipal folders)
- Automatically extracts email data when bonfire registration received
- Azure OpenAI validates and structures the data
- Automatically creates Google Maps POI without human intervention
- Validation flags for incomplete/unclear registrations
- Manual review queue for flagged registrations only

**Data Capture:**
- Name, telephone, address
- Bonfire size, date/time
- Additional notes/details
- Municipality (automatically detected from email folder)

**Map Integration:**
- Google Maps POI creation with bonfire location markers
- Interactive map showing all registered bonfires
- Click marker to see contact details
- Search/filter by municipality (29 municipalities)
- Map view accessible in Bålmelding folder tab

**User Experience:**
- Dispatchers receive fire call from citizen
- Click Bålmelding tab → see map instantly
- Visually confirm if reported fire location matches registered bonfire
- Click marker if need to contact registrant
- Verification complete in < 10 seconds

#### Supporting Infrastructure

**Folder/Tab Navigation:**
- Excel-style tabs at top of application
- Four folders: Hva Skjer (home), Flash, Bålmelding, Innstillinger
- Default landing: "Hva Skjer"
- Auto-switch to Flash on message arrival (unless typing)
- Manual folder switching always available

**"Hva Skjer" Layout:**
- Left column: Viktige meldinger (event messages)
- Top-right: Bilstatus (S111/S112 boxes)
- Bottom-right: Vaktplan (duty roster)

**Authentication & Access Control:**
- Google OAuth authentication
- Whitelist-based operator access
- Role-based permissions (operator vs administrator)

**Application Design:**
- Web-based but looks/feels like native desktop application
- No browser UI chrome (address bar, favorites, bookmarks)
- Fullscreen app mode or PWA
- Professional emergency services aesthetic
- Optimized for 1/4 of 49" monitor display

**Real-time Synchronization:**
- All 3-5 dispatchers see updates simultaneously
- WebSocket or Server-Sent Events for flash messages
- Sub-second latency for critical updates

**Audit Logging:**
- Track all user actions (create, edit, delete)
- Log flash messages sent (if needed for accountability)
- Log bilstatus changes (who toggled, when)
- Log event creation/modification
- Timestamp and user identity for all actions
- 1-year retention for operational data

### Growth Features (Post-MVP)

Features to add after successful MVP deployment and testing:

**Flash Message Enhancements:**
- Adjustable blink intensity (prevent overstimulation)
- Quick-reply templates ("På vei", "Forstått")
- Message reactions (read receipts)
- Flash message analytics (volume, response times)

**Bilstatus Intelligence:**
- Automatic workload balancing suggestions
- Response count tracking (S111: 12 utrykninger | S112: 11 utrykninger)
- Integration with actual dispatch system (if API access granted)

**Event Control Enhancements:**
- Message filtering by date/category
- Pin important messages to top
- Event templates for recurring items (weekly drills, etc.)
- Integration with external systems (weather, traffic)

**Bålmelding Advanced Features:**
- Historical bonfire analytics and trends
- Heat map visualization of high-bonfire areas
- Automated expiration reminders
- SMS confirmation to citizens after registration
- Email notifications to dispatchers for new registrations

**Wall Screen Application:**
- Shared display visible to all operators
- Shows flash messages with blinking on large wall screen
- Shared admin user login (credentials known by all operators)
- Auto-return to "Hva Skjer" display 5 minutes after last flash
- Ensures redundancy - operators can't miss critical messages

### Vision (Future)

**Phase 2 (Months 2-6):**
- Migration to on-premises Windows Server + IIS (when server access granted)
- Migration from Google OAuth to Microsoft Entra ID (Azure AD)
- Public bonfire registration (remove authentication requirement)
- Mobile-responsive internal interface
- Mobile companion app for field units
- Weather data integration for risk assessment
- Advanced map features (heat maps, custom styling)

**Phase 3 (6+ Months):**
- Integration with primary Locus Emergency Operation system (if API access granted)
- Native mobile app for operators
- Integration with public alert systems
- Automated reporting and compliance dashboards
- Multi-tenant support for other emergency response centers
- API for third-party integrations

---

## Domain-Specific Requirements

### Emergency Services Compliance

**Government Security Standards:**
- Azure OpenAI must use government-compliant endpoints
- Secure handling of citizen personal information (names, phones, addresses)
- No third-party data sharing except essential services (Google Maps geocoding)
- SSL/TLS encryption for all data transmission
- Audit trail for compliance and incident investigation

**GDPR Compliance:**
- Explicit consent on bonfire registration form
- Clear privacy policy displayed during registration
- Automatic deletion after retention period (90 days for bonfires, 1 year for operational data)
- Right to deletion via email/phone request
- Data minimization - only collect necessary information

**Operational Requirements:**
- System must operate independently from Locus Emergency Operation System
- No API integration possible with primary emergency system
- Zero tolerance for downtime during critical operations
- Must support 4-6 concurrent users without performance degradation
- Optimized for quarter-screen 49" monitor viewport (~1280x1440 or 2560x720)

### Integration Constraints

**Power Automate Integration:**
- Monitor shared mailbox with 29 municipal folders
- Extract bonfire registration emails
- Parse structured data from government form submissions
- Trigger Azure OpenAI processing pipeline
- Create Google Maps POI automatically

**Azure OpenAI Integration:**
- Government security-compliant configuration
- Parse freeform email content
- Extract: name, phone, address, bonfire size, date/time, notes
- Validate extracted data completeness
- Flag unclear/incomplete registrations for manual review
- Auto-approve clear registrations

**Google Maps Integration:**
- Geocoding API for address-to-coordinates conversion
- Places Autocomplete for citizen address entry
- Interactive Maps JavaScript API for POI display
- Marker clustering for performance with many bonfires
- API key security (HTTP Referer and IP restrictions)

This section shapes all functional and non-functional requirements below.

---

## Innovation & Novel Patterns

### Smart Typing Detection

**Innovation:** Context-aware notification system that detects when operators are actively typing and defers flash message display to avoid interrupting critical work.

**How It Works:**
- System monitors keyboard activity across all dispatcher sessions
- When flash message sent, checks if recipient is actively typing
- If typing: Flash tab blinks instead of auto-switching (less disruptive)
- If not typing: Auto-switch to Flash folder immediately
- Respects operator focus during emergency call documentation

**Value:** Balances urgency with non-disruption - flash messages are important but shouldn't interrupt active emergency response work.

### Automatic Vehicle Rotation Logic

**Innovation:** Paired vehicle status system with mutual exclusivity rules prevents workload imbalance and ensures one truck is always ready.

**Business Rules:**
- Never both trucks same color (automatic enforcement)
- If S111 green → S112 must be red (and vice versa)
- If one truck grey (out of service) → other MUST be green (safety guarantee)
- Single-click toggle automatically updates both trucks

**Value:** Prevents dispatcher error during high-stress situations. System enforces fairness rules automatically.

### Two-Phase AI Automation Strategy

**Innovation:** Start with human-in-the-loop (manual chatbot) to validate AI accuracy, then graduate to full automation once proven reliable.

**Phase 1:** Dispatcher copy-pastes email → AI extracts data → Dispatcher reviews → Approves → POI created
**Phase 2:** Email arrives → AI extracts data → Auto-creates POI (manual review only if flagged)

**Validation Approach:**
- Monitor AI extraction accuracy during Phase 1 pilot
- Track false positive rate (incorrect data extraction)
- Track false negative rate (failed to extract valid data)
- Graduate to Phase 2 when accuracy > 95%
- Maintain manual review queue for edge cases

**Value:** Reduces risk of AI errors impacting operations while building operator confidence in automation.

### Multi-Layered Attention Architecture

**Innovation:** Flash messages appear on both individual operator screens AND shared wall screen, creating redundant notification channels.

**Redundancy Strategy:**
- Individual screens: Personal notification with blink animation
- Wall screen: Shared display visible to entire room
- Operators can't miss critical messages even if focused elsewhere

**Value:** In emergency environments, information must be impossible to miss. Multiple channels ensure 100% delivery.

---

## Web Application (SaaS B2B) Specific Requirements

### Web Application Architecture

**Deployment Model:**
- Cloud-hosted during student project phase (Vercel, Railway, Render, or Fly.io)
- Migration to on-premises Windows Server + IIS planned post-project
- Internet-accessible with authentication gateway
- Continuous deployment from Git repository
- SSL/TLS automatic via hosting platform

**Browser Compatibility:**
- Primary: Microsoft Edge (latest 2 versions)
- Secondary: Google Chrome (latest 2 versions)
- Desktop-only for operator interface
- Mobile-responsive for bonfire registration portal

**Progressive Web App (PWA) Capabilities:**
- Installable as desktop app
- Launches without browser chrome
- Fullscreen app mode
- Offline-capable for basic functionality
- Background sync for flash messages

### Authentication & Authorization

**Google OAuth 2.0:**
- No password storage in application
- JWT-based sessions with 8-hour expiration
- Server-side token verification using Google public keys
- Whitelist-based operator access (database-driven approval)
- Bonfire registration requires Google authentication via special link

**Role-Based Access Control:**
- **Operator Role:**
  - View all data
  - Create flash messages, events, bonfire registrations
  - Edit own content
  - Toggle bilstatus
  - Cannot delete audit logs
  - Cannot manage user whitelist

- **Administrator Role:**
  - Full access (all operator permissions)
  - Delete any content
  - Manage user whitelist (add/remove operators)
  - View audit logs
  - Export data
  - System configuration access

**Session Management:**
- 8-hour session timeout
- Automatic token refresh
- Logout on browser close (optional)
- Single sign-on across tabs

### API Architecture

**RESTful API Design:**
- `/api/flash` - Flash message endpoints (POST, GET)
- `/api/events` - Event control CRUD (GET, POST, PATCH, DELETE)
- `/api/bilstatus` - Vehicle status endpoints (GET, PATCH)
- `/api/vaktplan` - Duty roster endpoints (GET, POST, PATCH)
- `/api/bonfires` - Bonfire registration (GET, POST, PATCH, DELETE)
- `/api/auth` - Authentication endpoints (NextAuth.js)
- `/api/audit` - Audit log queries (GET only)

**Real-Time Communication:**
- Server-Sent Events (SSE) for flash messages
- Automatic fallback to short polling (5-second interval) if SSE fails
- WebSocket connection for bidirectional updates (bilstatus, events)
- Optimized for Vercel edge functions (10-second serverless timeout)

**Data Validation:**
- Client-side validation (React Hook Form + Zod)
- Server-side validation (Zod schemas)
- Input sanitization (XSS prevention)
- SQL injection prevention (Prisma ORM)

---

## User Experience Principles

### Emergency-First Design Philosophy

**Core Principle: Seconds Matter**

Every interaction is optimized to minimize time between intent and action. In emergency response, delays measured in seconds can impact outcomes.

**Design Principles:**

1. **Zero-Click Awareness**
   Critical information visible without interaction - event dashboard, bilstatus, and flash messages appear automatically.

2. **Keyboard-First Interaction**
   Two-key shortcuts for flash messages. No hunting through menus during emergencies.

3. **Visual Clarity Under Stress**
   Color-coded status (green/red/grey for bilstatus, red for Pri 1 events). Operators can scan and understand in < 1 second.

4. **Minimal Cognitive Load**
   Simple folder structure (4 tabs). One folder = one purpose. No nested navigation.

5. **Forgiving Interaction**
   Easy to dismiss flash messages. Easy to edit bilstatus notes. Mistakes are quick to correct.

6. **Native Application Feel**
   No browser chrome. No "web app" aesthetic. Looks and feels like professional emergency services software.

### Visual Design Personality

**Professional, Serious, Functional**

- Emergency services aesthetic (not playful or casual)
- Clean, minimal design - no decorative elements
- High contrast for 24/7 readability (day shifts and night shifts)
- Large touch targets (click areas) for speed under stress
- Professional color palette (blues, greys, emergency red for Pri 1)

**Screen Real Estate Optimization:**
- Only 1/4 of one 49" monitor available
- Every pixel counts - no wasted space
- Compact layouts with maximum information density
- Scrolling minimized - most critical data above the fold

### Key Interactions

#### Flash Message Workflow
1. Dispatcher needs to communicate with team
2. Presses two-key shortcut (e.g., Ctrl+Shift+F)
3. Types brief message (1-10 words)
4. Press Enter to send
5. All dispatcher screens blink 3 times, then message line blinks continuously
6. Operators click message to read and stop blinking
7. Total time: < 5 seconds from need to delivery

#### Fire Verification Workflow
1. Citizen calls: "I see smoke at [address]"
2. Dispatcher clicks Bålmelding tab (single click)
3. Map displays with registered bonfires as POI markers
4. Dispatcher visually confirms location matches registered bonfire
5. If match: "That's a registered bonfire, no emergency"
6. If no match: Dispatch fire trucks
7. Total time: < 10 seconds (vs. several minutes searching email)

#### Bilstatus Toggle Workflow
1. S111 responds to emergency call
2. Dispatcher clicks S111 box once
3. S111 turns red (out), S112 turns green (ready) automatically
4. All dispatchers see updated status instantly
5. Total time: < 2 seconds

#### Grey Status with Note Workflow
1. Dispatcher right-clicks S111 box
2. Dialog appears: "Reason for grey status?"
3. Types note: "Dekkskift"
4. Clicks OK
5. S111 turns grey, S112 turns green automatically, note displays
6. All dispatchers see updated status
7. Total time: < 10 seconds

---

## Functional Requirements

### FR1: Flash Message System

**FR1.1 - Message Creation**
- Dispatcher triggers message input via two-key keyboard shortcut
- Text input field accepts 1-50 characters (recommended), 100 character hard limit
- Message sent to all connected dispatchers simultaneously
- Sender identity NOT displayed (anonymous broadcast)
- Message includes automatic timestamp

**Acceptance Criteria:**
- Keyboard shortcut works from any folder/tab
- Message broadcasts within 1 second of send
- All online dispatchers receive message (delivery confirmation)

**FR1.2 - Message Display**
- Dedicated message field at top of application (persistent across all folders)
- Message triggers 3 quick full-application blinks (0.2s on, 0.2s off, 0.2s on)
- Message line blinks continuously (1s on, 1s off) until acknowledged
- Click message to stop blinking and mark as read
- Newest message always displayed first
- Visual indicator shows unread message count

**Acceptance Criteria:**
- Blink animation works reliably across browsers
- Blinking stops immediately when clicked
- Multiple unread messages indicated clearly

**FR1.3 - Smart Auto-Switch**
- System detects if operator is actively typing (keyboard activity in last 3 seconds)
- If NOT typing: Auto-switch operator to Flash folder
- If typing: Flash tab blinks instead, no auto-switch
- Auto-return to "Hva Skjer" folder after 5 minutes of inactivity

**Acceptance Criteria:**
- Typing detection accuracy > 95%
- Auto-switch does not interrupt active typing
- Auto-return timer resets on user interaction

**FR1.4 - Message History**
- Display 3 most recent flash messages
- Scroll/paginate to view older messages
- Message history persists for 24 hours
- Older messages automatically archived

**Acceptance Criteria:**
- History accessible in Flash folder
- Messages sorted newest-first
- Archive process runs automatically

### FR2: Event Control Dashboard

**FR2.1 - Event Management**
- Create new operational events with title, description, priority
- Event fields: Title (required, 50 chars), Description (optional, 200 chars), Priority (Pri 1 or Normal), Timestamp (auto)
- Edit existing events (all fields except timestamp)
- Delete/archive events
- All operators can create, edit, delete any event

**Acceptance Criteria:**
- Event creation form validates required fields
- Events appear on all dispatcher screens immediately
- Edit/delete propagates in real-time

**FR2.2 - Priority System**
- Two priority levels: Pri 1 (Red/Critical) and Normal
- Pri 1 events highlighted in red
- Normal events displayed with standard styling
- Priority filter toggle (show all / show Pri 1 only)

**Acceptance Criteria:**
- Color-coding visually distinct
- Priority filter works instantly
- Pri 1 events always visible at top of list

**FR2.3 - Event Persistence**
- Events remain visible until manually resolved/deleted
- Events span hours or days (not seconds like flash messages)
- Active events persist across dispatcher shifts
- Resolved events moved to archive

**Acceptance Criteria:**
- Events survive browser refresh
- Events visible to new shift operators
- Archive searchable for historical reference

### FR3: Bilstatus (Vehicle Rotation) System

**FR3.1 - Status Display**
- Visual status boxes for each fire truck (S111, S112)
- Color-coded status: Green (ready), Red (out), Grey (out of service)
- Short text field in each box for notes (50 chars max)
- Status visible on "Hva Skjer" folder (top-right position)

**Acceptance Criteria:**
- Boxes prominently displayed and easily identifiable
- Color scheme meets accessibility standards
- Notes truncate gracefully if too long

**FR3.2 - Rotation Logic**
- Click box to toggle status between paired trucks
- When S111 goes green, S112 automatically goes red (and vice versa)
- System prevents both trucks from being green simultaneously
- System prevents both trucks from being red if neither is grey

**Acceptance Criteria:**
- Toggle works with single click
- Mutual exclusivity enforced automatically
- Error message if invalid state attempted

**FR3.3 - Grey Status with Notes**
- Right-click box to set grey status
- Dialog prompts for reason note (required)
- Common notes: "Dekkskift", "Mangler mannskaper", "På øvelse"
- Edit note anytime while grey
- Cancel grey status returns to red/green rotation

**Acceptance Criteria:**
- Right-click menu appears reliably
- Note required before setting grey
- Note edit accessible from right-click menu
- Paired truck automatically goes green when one set to grey

**FR3.4 - Real-Time Sync**
- All dispatchers see bilstatus changes instantly
- Status updates propagate within 1 second
- Audit log captures who changed status and when

**Acceptance Criteria:**
- Multi-user testing shows synchronization
- Audit log entries created automatically
- No conflicts if multiple dispatchers toggle simultaneously

### FR4: Vaktplan (Duty Roster)

**FR4.1 - Weekly Overview**
- Display current week's duty assignments
- Key positions: vakthavende brannsjef, innsatsleder brann, etc.
- Position name + assigned person name
- Located below bilstatus in top-right of "Hva Skjer" folder

**Acceptance Criteria:**
- All positions displayed clearly
- Current week auto-detected from system date
- Layout fits in allocated space

**FR4.2 - Roster Updates**
- Administrators can update assignments
- Week selection (current week or future weeks)
- Changes visible immediately to all dispatchers

**Acceptance Criteria:**
- Edit interface simple and fast
- Week navigation intuitive
- Changes audit-logged

### FR5: Bålmelding (Bonfire Registration)

**FR5.1 - Phase 1: Manual Chatbot Pilot**
- Azure OpenAI chatbot interface accessible to dispatchers
- Copy-paste email content into chatbot
- AI extracts: name, phone, address, bonfire size, date/time, notes, municipality
- Dispatcher reviews extracted data
- Dispatcher approves or edits before POI creation
- Manual review queue for all registrations

**Acceptance Criteria:**
- Chatbot interface accessible in Bålmelding folder
- AI extraction accuracy > 90% for complete emails
- Dispatcher can edit extracted fields before approval
- POI created only after dispatcher approval

**FR5.2 - Phase 2: Full Automation**
- Power Automate monitors shared mailbox (29 municipal folders)
- Email arrival triggers extraction workflow
- Azure OpenAI extracts structured data
- Validation checks data completeness
- If complete: Auto-create Google Maps POI
- If incomplete: Flag for manual review queue
- Dispatchers review only flagged registrations

**Acceptance Criteria:**
- Power Automate flow triggers reliably on new email
- AI extraction accuracy > 95% for complete registrations
- Incomplete registrations flagged (not auto-approved)
- Manual review queue accessible to dispatchers
- POI creation happens without dispatcher intervention for clear registrations

**FR5.3 - Google Maps Integration**
- Create POI marker at bonfire location (geocoded from address)
- Marker displays: name, phone, address, bonfire size, date/time, notes
- Interactive map in Bålmelding folder tab
- Click marker to see full details
- Municipality filter (dropdown of 29 municipalities)
- Search by address or name

**Acceptance Criteria:**
- Geocoding accuracy > 95% for Norwegian addresses
- All markers visible on map
- Marker clustering works with 500+ bonfires
- Filter and search perform instantly

**FR5.4 - Automatic Expiration**
- Bonfire registrations expire automatically based on date_to field
- Expired bonfires removed from map
- Expired data retained for 90 days, then deleted (GDPR compliance)

**Acceptance Criteria:**
- Expiration runs automatically (daily cron job)
- Expired bonfires disappear from map
- Data deletion audit-logged

### FR6: Authentication & Access Control

**FR6.1 - Google OAuth Login**
- Login button redirects to Google OAuth consent screen
- User authorizes with Google account
- Application receives OAuth token
- User redirected back to application

**Acceptance Criteria:**
- OAuth flow works reliably
- No password storage in application
- Token verification server-side

**FR6.2 - Whitelist-Based Access**
- Only whitelisted Google account emails can access operator system
- Administrator manages whitelist (add/remove emails)
- Non-whitelisted users see "Access Denied" message with contact info
- Bonfire registration portal requires Google authentication via special link

**Acceptance Criteria:**
- Whitelist checked on every login
- Non-whitelisted users blocked
- Whitelist management interface for administrators

**FR6.3 - Role-Based Permissions**
- Operator role: View, create, edit own content, toggle bilstatus
- Administrator role: All operator permissions + delete, manage users, view audit logs
- Role assigned during whitelist addition
- Role determines UI availability (hide admin features for operators)

**Acceptance Criteria:**
- Permissions enforced server-side (not just UI hiding)
- Role-based UI rendering works correctly
- Unauthorized actions return 403 Forbidden

### FR7: Audit Logging

**FR7.1 - Action Tracking**
- Log all data modifications: create, update, delete
- Capture: user_id, user_email, timestamp, table_name, record_id, old_values, new_values, action_type
- Automatic logging via database triggers or application middleware
- No user intervention required

**Acceptance Criteria:**
- All CRUD operations logged
- Logs include before/after values for updates
- Timestamps in UTC

**FR7.2 - Audit Log Access**
- Administrators can query audit logs
- Filter by: user, table, date range, action type
- Export audit logs to CSV
- Operators can view audit logs (read-only)

**Acceptance Criteria:**
- Query interface performs quickly (indexed timestamps)
- Export works for large result sets
- Audit logs cannot be edited or deleted

**FR7.3 - Retention Policy**
- Operational data audit logs: 1 year retention
- Bonfire data audit logs: 90 days retention
- Automatic cleanup via scheduled job

**Acceptance Criteria:**
- Retention policy enforced automatically
- Cleanup runs daily
- Cleanup audit-logged (meta-logging)

### FR8: Folder/Tab Navigation

**FR8.1 - Tab Structure**
- Four folders: Hva Skjer (home), Flash, Bålmelding, Innstillinger
- Excel-style tabs at very top of application
- Active tab highlighted
- Manual click to switch tabs

**Acceptance Criteria:**
- Tab navigation works reliably
- Active tab visually distinct
- Tab labels clear and readable

**FR8.2 - Default & Auto-Switch Behavior**
- Default landing: "Hva Skjer" folder on login
- Flash message arrival: Auto-switch to Flash (unless typing)
- Auto-return: Back to "Hva Skjer" after 5 minutes inactivity in Flash
- Manual tab switching overrides auto-switch

**Acceptance Criteria:**
- Default landing works on login
- Auto-switch respects typing detection
- Auto-return timer works correctly
- Manual switching has priority over auto-behavior

### FR9: Real-Time Synchronization

**FR9.1 - Multi-User Updates**
- All data changes propagate to all connected dispatchers in real-time
- Flash messages: < 1 second delivery
- Bilstatus changes: < 1 second
- Event updates: < 2 seconds
- Bonfire POI creation: < 5 seconds

**Acceptance Criteria:**
- Real-time updates work with 4-6 concurrent users
- No lost updates during simultaneous edits
- Latency meets targets

**FR9.2 - Connection Resilience**
- Server-Sent Events (SSE) for real-time updates
- Automatic fallback to short polling (5-second interval) if SSE fails
- Reconnection attempts if connection drops
- User notification if real-time updates unavailable

**Acceptance Criteria:**
- SSE works in Edge and Chrome
- Fallback activates automatically if SSE fails
- Reconnection succeeds after temporary network issues

---

## Non-Functional Requirements

### Performance

**Response Time Targets:**
- Initial page load (internal): < 3 seconds (cloud hosting)
- Bonfire registration form: < 2 seconds
- Map rendering (100 markers): < 2 seconds
- Map rendering (500 markers with clustering): < 3 seconds
- API response time: < 500ms (cloud roundtrip)
- Real-time notification delivery: < 3 seconds (SSE) or < 8 seconds (polling fallback)
- Flash message delivery: < 1 second between operators

**Rationale:** In emergency response, every second counts. Flash messages must arrive instantly. Bonfire verification must be faster than email search (which takes minutes).

**Database Performance:**
- Query response time: < 100ms for standard queries
- Slow query logging threshold: > 500ms
- Indexes on all frequently queried fields
- Connection pooling for concurrent users

**Frontend Performance:**
- Lighthouse Performance score > 90
- First Contentful Paint < 1.5 seconds
- Time to Interactive < 3 seconds
- Optimized bundle size (code splitting)

### Security

**Authentication Security:**
- Google OAuth 2.0 (no password storage)
- JWT-based sessions with 8-hour expiration
- Server-side token verification using Google public keys
- Whitelist-based operator access
- HTTPS/TLS encryption (automatic via Vercel)

**Application Security:**
- SQL injection prevention via Prisma ORM (parameterized queries)
- XSS protection with React (automatic escaping) and Content Security Policy
- CSRF protection via NextAuth (SameSite cookies)
- Input validation client and server-side (Zod schemas)
- Rate limiting on bonfire registration (5 submissions per user per hour)
- API key security (environment variables, never in source control)

**Data Security:**
- Encryption at rest (database provider)
- Encryption in transit (TLS)
- Secure handling of citizen personal information
- No third-party data sharing except essential services (Google Maps)
- API keys with HTTP Referer and IP restrictions
- API key rotation every 90 days

**GDPR Compliance:**
- Explicit consent on bonfire registration form
- Clear privacy policy
- Automatic deletion after retention period (90 days for bonfires, 1 year for operational data)
- Right to deletion via email/phone request
- Data minimization principle

**Audit & Accountability:**
- Comprehensive audit logging
- Tamper-proof logs (append-only)
- Administrator actions logged
- Security incident detection and alerting

### Scalability

**Current Scale Requirements:**
- Support 4-6 concurrent dispatchers (typical shift size)
- Handle 100+ daily bonfire registrations during peak season
- Store 10,000+ historical bonfire records
- Map performance up to 1,000 active markers with clustering
- 10 flash messages per shift average (range: 0-30)
- 25,000+ logged incidents annually (context, not direct load on this system)

**Vertical Scaling:**
- Cloud hosting allows easy resource scaling
- Database connection pooling
- Optimized queries and indexes
- Caching strategy for frequently accessed data

**Horizontal Scaling:**
- Stateless API design (JWT sessions)
- Vercel serverless functions scale automatically
- Database can scale independently
- Real-time connections use edge infrastructure

**Future Scale Considerations:**
- Multi-tenant support (other emergency centers)
- Increased concurrent users (10-20+)
- Larger geographic coverage (additional municipalities)
- Historical data growth (multi-year retention)

### Integration

**Power Automate Integration:**
- Monitor shared mailbox (29 municipal folders)
- Email trigger reliability (must not miss registrations)
- Retry logic for failed extractions
- Error handling and notification

**Azure OpenAI Integration:**
- Government security-compliant endpoint
- Rate limiting compliance
- Fallback to manual review if API unavailable
- Cost monitoring (pay-per-use)
- Response time < 3 seconds for email parsing

**Google Maps API Integration:**
- Geocoding API for address-to-coordinates
- Places Autocomplete API for address entry
- Maps JavaScript API for interactive map
- Usage monitoring to stay within budget ($200/month free tier)
- Error handling for failed geocoding
- Marker clustering library (@googlemaps/markerclusterer)

**Email Integration:**
- Access to shared mailbox via Power Automate
- Parse emails from government form submissions
- Handle variations in email format
- Extract structured data reliably

### Reliability & Availability

**Uptime Targets:**
- 99%+ uptime (acceptable for cloud-hosted student project)
- Planned maintenance during low-traffic periods (2-4 AM)
- Graceful degradation if external services unavailable

**Failure Handling:**
- Real-time updates: SSE → polling fallback
- AI extraction: Manual review fallback
- Google Maps: Cached data + retry
- Database: Connection retry logic
- User notification if critical services down

**Data Integrity:**
- Database transactions for multi-step operations
- Automatic backups (cloud provider)
- Validation before data persistence
- Audit trail for all changes

**Disaster Recovery:**
- Database backups (daily)
- Environment configuration backed up
- Code versioned in Git
- Recovery Time Objective (RTO): < 4 hours
- Recovery Point Objective (RPO): < 24 hours

### Monitoring & Observability

**Application Monitoring:**
- Vercel deployment logs and analytics
- Error tracking (Vercel integrated or Sentry)
- Page load times
- API response times
- SSE connection stability

**Database Monitoring:**
- Slow query logging (> 500ms)
- Connection pool utilization
- Query error rate

**External Service Monitoring:**
- Google Maps API usage and quota
- Azure OpenAI API usage and cost
- Power Automate flow success rate
- Email processing delays

**Alerting:**
- Critical error notifications
- API quota warnings
- Database connection failures
- Real-time update failures

---

## Implementation Planning

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `/bmad:bmm:workflows:create-epics-and-stories` to create the implementation breakdown.

---

## References

- **Product Brief:** [docs/product-brief-hva-skjer-2025-11-10.md](docs/product-brief-hva-skjer-2025-11-10.md)
- **Proposal:** [proposal.md](proposal.md)
- **Brainstorming Session:** [docs/brainstorming-session-results-2025-11-01.md](docs/brainstorming-session-results-2025-11-01.md)
- **Existing Bonfire Form:** https://www.rogbr.no/meldinger/melding-om-bruk-av-ild-utend%c3%b8rs

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `/bmad:bmm:workflows:create-epics-and-stories`
2. **Architecture** - Run: `/bmad:bmm:workflows:architecture`
3. **UX Design** (optional) - Run: `/bmad:bmm:workflows:create-ux-design`

---

_This PRD captures the essence of Hva Skjer - **seconds saved during emergencies through ruthless focus on speed, intelligent automation, and emergency-first design**._

_Created through collaborative discovery between BIP and AI facilitator._
