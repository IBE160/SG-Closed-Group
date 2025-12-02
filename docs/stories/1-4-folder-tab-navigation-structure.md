# Story 1.4: Folder/Tab Navigation Structure

Status: done

## Story

As a dispatcher,
I want to navigate between application folders using Excel-style tabs,
So that I can quickly switch between different operational views.

## Acceptance Criteria

1. **AC-1.4.1:** Four tabs are displayed at the top: "Hva Skjer", "Flash", "Bålmelding", "Innstillinger"
2. **AC-1.4.2:** The active tab is visually highlighted (distinct background/border/underline)
3. **AC-1.4.3:** Clicking a tab switches the view instantly (< 200ms perceived)
4. **AC-1.4.4:** "Hva Skjer" is the default landing tab when app loads
5. **AC-1.4.5:** Tab state persists across page refreshes (URL-based routing)
6. **AC-1.4.6:** Keyboard navigation works (Ctrl+1/2/3/4 per UX spec)

## Tasks / Subtasks

- [x] **Task 1: Create App Layout with Tab Navigation** (AC: 1.4.1, 1.4.2)
  - [x] 1.1: Create `components/layout/app-layout.tsx` with header containing tabs
  - [x] 1.2: Created custom tab-navigation.tsx using Next.js Link for routing
  - [x] 1.3: Style tabs with emergency theme (dark background, blue accent for active)
  - [x] 1.4: Position tabs at very top of viewport (Excel-style)

- [x] **Task 2: Implement Route-Based Tab Switching** (AC: 1.4.3, 1.4.5)
  - [x] 2.1: Create Next.js App Router routes: `/hva-skjer`, `/flash`, `/balmelding`, `/innstillinger`
  - [x] 2.2: Set `/` (root) as redirect to `/hva-skjer`
  - [x] 2.3: Sync tab active state with current URL path
  - [x] 2.4: Use Next.js `usePathname()` to determine active tab

- [x] **Task 3: Configure Default Landing and Navigation** (AC: 1.4.4)
  - [x] 3.1: `/` redirects to "Hva Skjer" tab via Next.js redirect()
  - [x] 3.2: Create placeholder content for each tab route
  - [x] 3.3: Add basic page structure for each folder

- [x] **Task 4: Add Keyboard Navigation Shortcuts** (AC: 1.4.6)
  - [x] 4.1: Implement global keyboard event listener in tab-navigation.tsx
  - [x] 4.2: Map Ctrl+1 → "Hva Skjer", Ctrl+2 → "Flash", Ctrl+3 → "Bålmelding", Ctrl+4 → "Innstillinger"
  - [x] 4.3: Use `useRouter()` for programmatic navigation

- [x] **Task 5: Verify Build and Test Navigation** (AC: all)
  - [x] 5.1: Tab components created and functional
  - [x] 5.2: URL changes on tab click (Link-based navigation)
  - [x] 5.3: Page refresh maintains correct tab (URL-based state)
  - [x] 5.4: `npm run build` - Compiled successfully with 8 routes

## Dev Notes

### Architecture Patterns and Constraints

**From architecture.md:**
- Next.js 14 App Router for file-based routing
- shadcn/ui for UI components (Tabs component already installed)
- URL-based state management for navigation
- Desktop-first design (quarter-screen 49" monitor viewport)

**From ux-design-specification.md:**
- Navigation Pattern: Excel-like tabs (top horizontal)
- Four tabs: "Hva Skjer" (home), "Flash", "Bålmelding", "Innstillinger"
- Active tab: Blue underline + brighter text
- Inactive tabs: Dimmed text (slate-400)
- Keyboard shortcuts: Ctrl+1 (Hva Skjer), Ctrl+2 (Flash), Ctrl+3 (Bålmelding), Ctrl+4 (Innstillinger)
- Always visible, no hamburger menu or collapsible navigation
- Tab width: 80px × 48px height per tab

**PRD Reference:**
- FR8: Folder/Tab Navigation - Excel-style tabs for instant folder switching

### Project Structure Notes

**Route Structure (Next.js App Router):**
```
app/
├── layout.tsx          # Root layout (existing, add AppLayout)
├── page.tsx            # Root → redirect to /hva-skjer or render directly
├── hva-skjer/
│   └── page.tsx        # "Hva Skjer" tab content
├── flash/
│   └── page.tsx        # "Flash" tab content (placeholder)
├── balmelding/
│   └── page.tsx        # "Bålmelding" tab content (placeholder)
└── innstillinger/
    └── page.tsx        # "Innstillinger" tab content (placeholder)
```

**Components to Create:**
- `components/layout/app-layout.tsx` - Main layout wrapper with tabs
- `components/layout/tab-navigation.tsx` - Tab navigation component

### Learnings from Previous Story

**From Story 1-3-tailwind-css-and-shadcn-ui-component-library-setup (Status: review)**

- **Tabs Component Available**: `components/ui/tabs.tsx` already installed - USE THIS
- **Dark Mode Theme**: CSS variables configured in globals.css
- **Fonts**: Inter and JetBrains Mono configured in layout.tsx
- **Emergency Theme Utilities**: `.focus-ring`, `.touch-target` available for accessibility
- **Build Verified**: All TypeScript and build passing

[Source: .bmad-ephemeral/stories/1-3-tailwind-css-and-shadcn-ui-component-library-setup.md#Dev-Agent-Record]

**Key Files to Reuse:**
- `components/ui/tabs.tsx` - shadcn/ui Tabs component
- `app/globals.css` - Theme variables and utilities
- `app/layout.tsx` - Root layout (extend with navigation)

### References

**Technical Specification:**
- [Source: docs/epics.md#Story 1.4] - Story definition lines 134-161

**Architecture Documentation:**
- [Source: docs/architecture.md] - Next.js App Router routing approach

**UX Design:**
- [Source: docs/ux-design-specification.md#4.1] - Navigation patterns and keyboard shortcuts
- Tab styling: Active = blue underline + slate-100, Inactive = slate-400

**PRD Reference:**
- FR8: Folder/Tab Navigation - Excel-style tab navigation
- FR8.2: Default & Auto-Switch Behavior - "Hva Skjer" is default landing

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **2025-11-22**: Story 1.4 implementation completed
  - Created tab-navigation component using Next.js Link for URL-based routing
  - AppLayout wraps all pages with persistent tab navigation
  - Dark mode enabled by default (className="dark" on html)
  - Keyboard shortcuts Ctrl+1/2/3/4 implemented
  - All 4 routes created with placeholder content
  - Root "/" redirects to "/hva-skjer"
  - Build successful - 8 routes generated

### File List

**Created:**
- components/layout/app-layout.tsx - Main layout wrapper with tabs
- components/layout/tab-navigation.tsx - Tab navigation with keyboard shortcuts
- app/hva-skjer/page.tsx - "Hva Skjer" tab placeholder
- app/flash/page.tsx - "Flash" tab placeholder
- app/balmelding/page.tsx - "Bålmelding" tab placeholder
- app/innstillinger/page.tsx - "Innstillinger" tab placeholder

**Modified:**
- app/layout.tsx - Added AppLayout wrapper, dark mode class
- app/page.tsx - Changed to redirect to /hva-skjer
