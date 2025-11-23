# Story 1.5: "Hva Skjer" Folder Layout Structure

Status: done

## Story

As a dispatcher,
I want to see the "Hva Skjer" folder with proper layout sections,
So that I have organized areas for events, bilstatus, and vaktplan.

## Acceptance Criteria

1. **AC-1.5.1:** Three distinct layout sections are visible:
   - Left column: "Viktige meldinger" (event messages) - full height
   - Top-right: "Bilstatus" area (placeholder for S111/S112 boxes)
   - Bottom-right: "Vaktplan" area (duty roster placeholder)
2. **AC-1.5.2:** Layout is responsive for 1/4 of 49" monitor viewport (~1280×1440 or 2560×720)
3. **AC-1.5.3:** All sections have clear visual boundaries (borders or background differentiation)
4. **AC-1.5.4:** Content areas are ready for feature implementation (placeholder content)
5. **AC-1.5.5:** Layout uses CSS Grid or Flexbox for proper structure
6. **AC-1.5.6:** Minimal scrolling required - most critical data above fold

## Tasks / Subtasks

- [x] **Task 1: Create Hva Skjer Layout Component** (AC: 1.5.1, 1.5.5)
  - [x] 1.1: Create `components/hva-skjer/hva-skjer-layout.tsx` with CSS Grid
  - [x] 1.2: Define grid template: left column (1fr) + right column (400px fixed)
  - [x] 1.3: Subdivide right column: top (Bilstatus) + bottom (Vaktplan) with flexbox

- [x] **Task 2: Create Section Components** (AC: 1.5.3, 1.5.4)
  - [x] 2.1: Create `components/hva-skjer/viktige-meldinger.tsx` - event messages section
  - [x] 2.2: Create `components/hva-skjer/bilstatus-section.tsx` - vehicle status placeholder
  - [x] 2.3: Create `components/hva-skjer/vaktplan-section.tsx` - duty roster placeholder

- [x] **Task 3: Style Sections with Emergency Theme** (AC: 1.5.3)
  - [x] 3.1: Add visual boundaries using shadcn/ui Card components
  - [x] 3.2: Apply dark theme styles (Card backgrounds, borders)
  - [x] 3.3: Use section headers with font-semibold typography

- [x] **Task 4: Update Hva Skjer Page** (AC: 1.5.1)
  - [x] 4.1: Replace placeholder content in `app/hva-skjer/page.tsx`
  - [x] 4.2: Import and render HvaSkjerLayout component

- [x] **Task 5: Optimize for Quarter-Screen Viewport** (AC: 1.5.2, 1.5.6)
  - [x] 5.1: Layout uses calc(100vh-48px) for full viewport height minus tabs
  - [x] 5.2: No scrolling required - full viewport usage
  - [x] 5.3: Compact padding (p-4, gap-4) for optimal space usage

- [x] **Task 6: Verify Build** (AC: all)
  - [x] 6.1: `npm run build` - Compiled successfully
  - [x] 6.2: TypeScript types verified with `npx tsc --noEmit`

## Dev Notes

### Architecture Patterns and Constraints

**From architecture.md:**
- Next.js 14 App Router
- shadcn/ui Card component for section containers
- CSS Grid for complex layouts
- Desktop-first design (quarter-screen 49" monitor viewport)

**From ux-design-specification.md:**
- "Hva Skjer" is the primary operational view
- Three-panel layout: Events (left), Bilstatus + Vaktplan (right)
- High contrast, emergency-first design
- Larger text for readability in dimmed environments

**From PRD:**
- FR2: Event Control Dashboard - "Viktige meldinger" section
- FR3: Bilstatus - Vehicle rotation boxes (S111/S112)
- FR4: Vaktplan - Duty roster display

### Project Structure Notes

**Components to Create:**
```
components/hva-skjer/
├── hva-skjer-layout.tsx    # Main grid layout
├── viktige-meldinger.tsx   # Left column - events
├── bilstatus-section.tsx   # Top-right - vehicle status
└── vaktplan-section.tsx    # Bottom-right - duty roster
```

**Layout Structure:**
```
┌─────────────────────┬────────────────┐
│                     │   BILSTATUS    │
│  VIKTIGE MELDINGER  │   (S111/S112)  │
│  (Event Messages)   ├────────────────┤
│                     │   VAKTPLAN     │
│                     │  (Duty Roster) │
└─────────────────────┴────────────────┘
     ~60-70%               ~30-40%
```

### Learnings from Previous Story

**From Story 1-4-folder-tab-navigation-structure (Status: review)**

- **Tab Navigation Working**: AppLayout with TabNavigation at top
- **Routes Created**: `/hva-skjer` route exists with placeholder
- **Dark Mode Active**: `class="dark"` on html element
- **Layout Pattern**: AppLayout wraps children, tabs persist across routes

[Source: .bmad-ephemeral/stories/1-4-folder-tab-navigation-structure.md#Dev-Agent-Record]

**Key Files to Modify:**
- `app/hva-skjer/page.tsx` - Replace placeholder with layout

**Key Files to Reuse:**
- `components/ui/card.tsx` - shadcn/ui Card for section containers
- `app/globals.css` - Emergency theme utilities

### References

**Technical Specification:**
- [Source: docs/epics.md#Story 1.5] - Story definition lines 163-191

**Architecture Documentation:**
- [Source: docs/architecture.md] - Layout patterns and component structure

**UX Design:**
- [Source: docs/ux-design-specification.md] - "Hva Skjer" layout specifications

**PRD Reference:**
- FR2: Event Control Dashboard - "Viktige meldinger" events section
- FR3: Bilstatus - Vehicle rotation system
- FR4: Vaktplan - Weekly duty roster

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **2025-11-22**: Story 1.5 implementation completed
  - Created three-panel layout for "Hva Skjer" operational view
  - CSS Grid layout: left column (flexible) + right column (400px fixed)
  - Right column uses flexbox: Bilstatus (top) + Vaktplan (bottom, flex-1)
  - All sections use shadcn/ui Card for visual boundaries
  - Placeholder content ready for Epic 3 features
  - Full viewport height utilization (calc(100vh-48px) accounting for tabs)
  - Build successful

### File List

**Created:**
- components/hva-skjer/hva-skjer-layout.tsx - Main CSS Grid layout
- components/hva-skjer/viktige-meldinger.tsx - Events section (left column)
- components/hva-skjer/bilstatus-section.tsx - Vehicle status (top-right)
- components/hva-skjer/vaktplan-section.tsx - Duty roster (bottom-right)

**Modified:**
- app/hva-skjer/page.tsx - Replaced placeholder with HvaSkjerLayout
