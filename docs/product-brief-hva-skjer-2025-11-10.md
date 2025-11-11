# Product Brief: Hva Skjer

**Date:** 2025-11-10
**Author:** BIP
**Context:** Enterprise/Workplace Application

---

## Executive Summary

Hva Skjer is an emergency response registration application being developed to restore critical functionality lost when the organization upgraded to a new emergency response system. The application addresses gaps left by the retirement of legacy systems and missing features in the current platform.

---

## Core Vision

### Problem Statement

After upgrading to a new emergency response registration system, critical operational capabilities were lost that directly impact emergency response coordination. The organization previously relied on:

1. **Flash Message System** - A rapid communication method for urgent alerts that is no longer available in the current system
2. **Event Control and Car Switching** - The ability to dynamically manage and reassign vehicles/units to emergency events, which was present in the legacy system but missing in the new platform
3. **Bålmelding (Bonfire) Registration** - A seasonal but essential capability for tracking and managing bonfire notifications, which was available in an earlier program that is no longer in use

These gaps force emergency response teams to work around system limitations, creating inefficiencies and potential safety risks during critical operations.

### Problem Impact

The missing functionality affects daily emergency response operations:

- **Flash messages**: Without rapid alert capability, critical time-sensitive information cannot be disseminated quickly to response teams
- **Event/vehicle management**: Inability to efficiently reassign vehicles creates coordination challenges during active emergencies
- **Bålmelding tracking**: Lack of bonfire registration system creates administrative burden and potential compliance issues, especially during peak bonfire season

### Why Existing Solutions Fall Short

The new emergency response system upgrade removed functionality that operational teams depended on. Neither the new system nor any remaining legacy tools provide these specific capabilities, leaving a functional gap in emergency response operations.

### Proposed Solution

Hva Skjer will provide a unified application that restores and enhances three critical emergency response capabilities:

**1. Flash Message System**
A rapid alert system allowing dispatchers to send instant short messages (typically one word or one sentence) that flash/display prominently on all operational desktop screens. Used for urgent coordination during active emergencies (e.g., "Stand by", "All clear") and non-emergency quick communications (e.g., lunch costs). Each dispatcher can independently decide to send a flash message via quick keyboard shortcut (two-key press).

**2. Event Control Dashboard**
A centralized view for managing important operational information that all dispatchers need to be aware of, such as:
- Road closures
- Training exercises (e.g., "Drilling with real fire - do not dispatch cars")
- Ongoing incidents requiring coordination
- Vehicle reassignment and availability status

**3. Bålmelding (Bonfire) Registration System**
An automated system to process citizen bonfire notifications and display them as Points of Interest (POI) in Google Maps, enabling dispatchers to quickly verify if a reported fire is legitimate or a registered bonfire. The system will:
- Process bonfire registrations from citizens (currently submitted via email across 29 municipal folders)
- Capture required information: name, telephone, address, bonfire size, and additional details per standardized form
- Automatically create Google Maps POI markers for registered bonfires
- Include Azure OpenAI pilot: Copy-paste email content into chatbot which extracts information and creates POI
- Auto-approve registrations by default, with optional manual review flag for unclear/incomplete submissions

### Key Differentiators

- **Keyboard-driven speed**: Flash messages via two-key shortcut for maximum speed during emergencies
- **Always-visible alerts**: Flash messages appear prominently on all dispatcher screens simultaneously
- **Intelligent automation**: Azure OpenAI integration for automated email parsing and POI creation
- **Reduces email overload**: Eliminates manual review of 29 municipal email folders
- **Real-time fire verification**: Instant map-based verification reduces false alarm responses
- **Single integrated solution**: Three critical functions in one application instead of fragmented tools

---

## Target Users

### Primary Users

**Emergency Dispatchers (3-5 per shift)**
Operating in a 24/7 emergency operations center with 12-hour shifts, dispatchers are the primary users who need instant access to all three core functions. They:
- Monitor multiple screens simultaneously while handling emergency calls
- Need to send and receive flash messages without interrupting their primary dispatch duties
- Must quickly verify if reported fires are legitimate emergencies or registered bonfires
- Coordinate vehicle assignments and maintain awareness of operational events (road closures, exercises, etc.)
- Work in a high-pressure environment where seconds matter

**User characteristics:**
- High technical comfort with multi-screen setups
- Experienced with keyboard shortcuts and rapid task-switching
- Require minimal UI friction - every click counts during emergencies
- Work collaboratively with other dispatchers on the same shift

### Secondary Users

**Citizens (Bonfire Registration)**
Citizens registering planned bonfires through the existing web form at https://www.rogbr.no/meldinger/melding-om-bruk-av-ild-utend%c3%b8rs. They:
- Submit bonfire notifications via the established government form
- Are not direct users of Hva Skjer application
- Expect their registration to be processed without manual follow-up

### User Journey

**Flash Message Workflow:**
1. Dispatcher identifies need to communicate with team (emergency coordination or quick info)
2. Presses two-key shortcut to open flash message prompt
3. Types brief message (1-10 words)
4. Message flashes prominently on all dispatcher screens immediately

**Event Control Workflow:**
1. Dispatcher becomes aware of operational event (road closure, drill, etc.)
2. Creates/updates event in Event Control dashboard
3. All dispatchers see the event information on their screens
4. Event remains visible until marked resolved/completed

**Truck Rotation Workflow:**
1. Station has paired trucks (e.g., S111 and S112) that alternate responses
2. After S111 responds to a call, dispatcher clicks to switch status
3. S111 becomes red (unavailable), S112 automatically becomes green (ready for next call)
4. If truck needs maintenance, dispatcher clicks to set grey and adds note ("maintenance until 14:00")
5. All dispatchers see current truck availability status in real-time
6. System prevents both trucks from being green simultaneously

**Bålmelding Workflow (Current State → Future State):**
- **Current:** Citizen submits form → Email to shared mailbox → Manual review of 29 municipal folders → Dispatcher manually tracks locations
- **Future:** Citizen submits form → Power Automate extracts data → Azure OpenAI validates/structures → Google Maps POI auto-created → Dispatcher sees POI on map instantly (or reviews flagged unclear registrations)

---

## Success Metrics

**Primary Success Criteria:**
- Dispatchers actively use all three features during regular operations
- System functions as planned without critical failures
- Features work reliably during testing period

**Operational Success Indicators:**
- Flash messages deliver instantly to all dispatcher screens (< 1 second)
- Event control dashboard updates are visible to all users in real-time
- Bonfire registrations are processed and appear as Google Maps POI automatically
- Zero manual email folder reviews needed for bålmelding during peak season

**User Adoption:**
- Dispatchers choose to use flash messages instead of alternative communication methods
- Event control dashboard becomes the primary source for operational awareness
- Bonfire verification time reduced from manual email review to instant map check

---

## MVP Scope

### Core Features

**All three capabilities must be fully functional in MVP:**

**1. Flash Message System (Complete)**
- Two-key keyboard shortcut to trigger message input
- Text input for short messages (1-50 characters recommended)
- Instant broadcast to all connected dispatcher screens
- Prominent visual display (flashing or highly visible alert)
- Message dismissal capability
- Persistent connection for real-time delivery

**2. Event Control Dashboard (Complete)**

**Event Management:**
- Create new operational events (road closures, drills, incidents, etc.)
- Event fields: Title, description, status, timestamp
- Real-time event list visible to all dispatchers
- Update event status (active/resolved)
- Delete/archive completed events
- Persistent display of active events

**Vehicle/Truck Rotation System:**
- Visual status boxes for each fire truck at the station (e.g., S111, S112)
- Color-coded status indicators:
  - **Green**: Ready/available for next assignment (one truck green at a time)
  - **Red**: Just responded/out on assignment (paired truck)
  - **Grey**: Out of service (maintenance, unavailable)
- Click to toggle status between trucks (when S111 goes green, S112 becomes red automatically)
- Short text field in each box for reason/notes (e.g., "maintenance", "responding to fire", etc.)
- System enforces rotation: Only one truck in a pair can be green (ready) at a time
- Real-time sync: All dispatchers see current truck status instantly

**3. Bålmelding Registration System (Complete - Full Automation)**
- **Phase 1 (Manual Pilot):** Azure OpenAI chatbot interface where dispatchers can copy-paste email content, AI extracts structured data, creates Google Maps POI
- **Phase 2 (Full Automation):** Power Automate flow monitors shared mailbox → extracts email data → Azure OpenAI validates/structures → automatically creates Google Maps POI
- Data capture: Name, telephone, address, bonfire size, date/time, additional notes
- Google Maps POI creation with bonfire location markers
- Validation flags for incomplete/unclear registrations
- Manual review queue for flagged registrations
- Map view showing all registered bonfires
- Search/filter bonfires by municipality (29 municipalities)

**Supporting Infrastructure:**
- Google OAuth authentication
- User access control (dispatcher role)
- Web-based responsive UI
- Multi-screen compatible
- Azure-hosted backend
- Real-time data synchronization across all clients

### MVP Success Criteria

- All three features operational and accessible via web browser
- Flash messages reach all connected dispatchers within 1 second
- Event control dashboard updates in real-time across all sessions
- Bålmelding automated workflow processes emails and creates POI without manual intervention
- System runs stably for 2-week test period during dispatcher operations
- Dispatchers can use the application without training documentation

### Out of Scope for MVP

- Mobile app version (web-only for MVP)
- Historical analytics/reporting dashboard
- Message templates or saved responses for flash messages
- Advanced event scheduling or calendar integration
- Integration with existing emergency response system
- Notification alerts to mobile devices
- Multi-language support (Norwegian only)
- Advanced user roles beyond dispatcher access
- Audit logging of all actions
- Backup/restore functionality
- Performance monitoring dashboard

### Future Vision

**Post-MVP Enhancements:**
- Mobile companion app for field units
- Integration with primary emergency response system for seamless data flow
- Analytics dashboard: flash message frequency, event types, bonfire trends
- Automated bonfire expiration (remove POI after event date passes)
- SMS notifications to citizens confirming bonfire registration
- Advanced filtering and search across all modules
- Message templates library for common flash messages
- Event templates for recurring operational events (weekly drills, etc.)
- Historical reporting for compliance and analysis
- API for third-party integrations
- Multi-tenant support for other emergency response centers

---

## Financial Considerations

**Development Costs:**
- Zero additional licensing costs (Microsoft Student Azure subscription already available)
- Developer time: Internal development, no external contractors

**Operational Costs:**
- **Azure hosting**: Covered by Student subscription initially, production costs TBD
- **Azure OpenAI API**: Pay-per-use, estimated low volume for bonfire season processing
- **Google Maps API**: POI creation costs, estimated usage for 29 municipalities during bonfire season
- **Power Automate**: Included in organizational Microsoft 365 licensing

**Cost Optimization Strategy:**
- Start with Student Azure to validate before production budget requests
- Monitor API usage during pilot to forecast production costs
- Rate limiting and caching to minimize API calls
- Leverage existing organizational assets (shared mailbox, Microsoft 365)

**Budget Constraints:**
- Must operate within Student Azure free tier limits initially
- No approved budget for external services - must demonstrate value first
- Cost optimization critical due to uncertain IT department funding support

## Technical Preferences

**Platform:** Web-based application (accessible via browser on dispatcher workstations)

**Authentication:** Google OAuth (switched from EntraID to avoid IT department approval delays)

**Technology Stack Requirements:**
- Microsoft Azure Student subscription for hosting
- Azure OpenAI (government security compliant) for email content extraction
- Google Maps API for POI creation and display
- Power Automate for email processing pipeline

**Integration Points:**
- Shared mailbox access for bonfire registration emails (29 municipal folders)
- Existing citizen form: https://www.rogbr.no/meldinger/melding-om-bruk-av-ild-utend%c3%b8rs
- Real-time messaging infrastructure for flash messages across multiple dispatcher screens

**Design Philosophy:**
- Keyboard-first interaction design (two-key shortcuts priority)
- Minimal clicks - optimize for speed in emergency situations
- Multi-screen compatible (dispatchers work with multiple monitors)
- Always-on/persistent connection for real-time updates

## Organizational Context

**Development Constraints:**
- Must be a completely self-contained solution requiring zero IT department approval or assistance
- IT department is very difficult to reach and slow to respond to requests
- Solution must work independently of internal IT infrastructure where possible

**Security Requirements:**
- Government-grade security compliance for Azure OpenAI usage
- Secure handling of citizen personal information (names, phone numbers, addresses)
- Access control limited to authorized dispatchers

**Operational Context:**
- 24/7 critical emergency response operations
- System downtime directly impacts emergency response capability
- High reliability and availability requirements
- Seasonal peak usage for bålmelding (bonfire season)

**Strategic Decision:**
- Switched from EntraID to Google OAuth specifically to maintain development autonomy
- Using Microsoft Student Azure subscription to bypass organizational procurement/approval processes
- Building complete solution to avoid dependency on unresponsive IT support

## Risks and Assumptions

**Technical Risks:**
- **Azure OpenAI API access uncertainty**: Unknown what level of API access IT department will grant for production use. Mitigation: Pilot with manual copy-paste workflow first, automated integration as phase 2
- **Google Maps API costs**: POI creation at scale may incur significant API costs. Mitigation: Monitor usage, implement rate limiting if needed
- **Real-time messaging scalability**: Flash messages must reach 3-5 screens instantly. Mitigation: Test WebSocket or similar real-time technology early
- **Power Automate reliability**: Email extraction automation success rate unknown. Mitigation: Build manual fallback for dispatcher review

**Organizational Risks:**
- **IT department restrictions**: Possible last-minute restrictions on Google OAuth or Azure services. Mitigation: Architecture designed for quick authentication provider swap
- **Security audit requirements**: Government security standards may require formal audit. Mitigation: Follow Azure security best practices from day one
- **User adoption**: Dispatchers may resist new tool if training required. Mitigation: Make UI intuitive enough for zero-training adoption

**Key Assumptions:**
- Microsoft Student Azure subscription has sufficient capacity/quotas for production use
- Existing citizen registration form will continue sending to accessible shared mailbox
- Dispatchers have browser access and can run web application on their workstations
- Google OAuth will be acceptable for authentication without formal IT approval
- Azure OpenAI will be available with government security compliance

## Timeline

**Critical Constraint:** This is a school assignment requiring ASAP delivery

**Development Approach:**
- Rapid development cycle prioritizing working functionality over polish
- Iterative deployment: Get basic features working, then refine
- Parallel development of three core modules where possible
- Focus on MVP completion with minimal viable features first

**Suggested Phasing:**
1. **Week 1-2:** Core infrastructure + Flash messaging + Event control (simpler features first)
2. **Week 2-3:** Bålmelding Phase 1 (manual chatbot interface)
3. **Week 3-4:** Bålmelding Phase 2 (Power Automate automation) + testing + refinement

**Time Pressure Implications:**
- Prioritize working code over comprehensive documentation
- Use proven technologies to minimize learning curve
- Defer nice-to-have features aggressively
- Accept technical debt that can be refactored later
- Focus testing on critical paths only

## Supporting Materials

**Referenced Resources:**
- Existing citizen bonfire registration form: https://www.rogbr.no/meldinger/melding-om-bruk-av-ild-utend%c3%b8rs
- Shared mailbox with 29 municipal email folders (accessible to development team)
- Microsoft Student Azure subscription
- Power Automate access via organizational Microsoft 365

**Context:**
This project addresses real operational gaps in an emergency response center following a system upgrade. The solution must be delivered as a school assignment while meeting actual workplace needs.

---

_This Product Brief captures the vision and requirements for Hva Skjer._

_It was created through collaborative discovery and reflects the unique needs of this Enterprise/Workplace Application project._

_Next: Use the PRD workflow to create detailed product requirements from this brief._
