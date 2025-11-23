# Story 1.3: Tailwind CSS and shadcn/ui Component Library Setup

Status: done

## Story

As a developer,
I want to configure Tailwind CSS and install shadcn/ui components,
So that I have a consistent, professional UI framework.

## Acceptance Criteria

1. **AC-1.3.1:** Tailwind CSS is properly configured with PostCSS integration
2. **AC-1.3.2:** Custom theme extends Tailwind with emergency services color palette (blues, greys, emergency red)
3. **AC-1.3.3:** shadcn/ui CLI is initialized and configured for the project
4. **AC-1.3.4:** Core shadcn/ui components are installed: Button, Input, Card, Dialog, Tabs
5. **AC-1.3.5:** Custom CSS variables are defined in globals.css for theming
6. **AC-1.3.6:** Typography and spacing follow the emergency services design system
7. **AC-1.3.7:** Layout is optimized for 1/4 of 49" monitor viewport (~1280×1440 or 2560×720)

## Tasks / Subtasks

- [x] **Task 1: Verify Tailwind CSS Configuration** (AC: 1.3.1)
  - [x] 1.1: Verify tailwind.config.ts exists and has correct content paths
  - [x] 1.2: Verify PostCSS configuration (postcss.config.mjs)
  - [x] 1.3: Verify Tailwind directives in app/globals.css (@tailwind base/components/utilities)
  - [x] 1.4: Test that Tailwind classes work in a component

- [x] **Task 2: Configure Custom Emergency Services Theme** (AC: 1.3.2, 1.3.5, 1.3.6)
  - [x] 2.1: Define color palette in tailwind.config.ts (success, warning, info semantic colors)
  - [x] 2.2: Define CSS variables in globals.css for light/dark theme support
  - [x] 2.3: Configure typography scale (emergency-base, emergency-sm, emergency-xs)
  - [x] 2.4: Configure spacing scale for emergency-first design (touch-target utility)

- [x] **Task 3: Initialize shadcn/ui** (AC: 1.3.3)
  - [x] 3.1: Created components.json configuration
  - [x] 3.2: Configured for TypeScript, default style, CSS variables
  - [x] 3.3: components.json created with correct paths
  - [x] 3.4: lib/utils.ts has cn() utility function (already existed)

- [x] **Task 4: Install Core Components** (AC: 1.3.4)
  - [x] 4.1: Install Button component
  - [x] 4.2: Install Input component
  - [x] 4.3: Install Card component
  - [x] 4.4: Install Dialog component
  - [x] 4.5: Install Tabs component
  - [x] 4.6: Also installed: Badge, Alert, Select, Textarea
  - [x] 4.7: All 9 components in components/ui/ directory

- [x] **Task 5: Configure Viewport and Layout Utilities** (AC: 1.3.7)
  - [x] 5.1: Added fontFamily configuration (Inter + JetBrains Mono)
  - [x] 5.2: Configured viewport metadata in app/layout.tsx
  - [x] 5.3: Added themeColor for light/dark mode

- [x] **Task 6: Verify Build and Type Safety** (AC: all)
  - [x] 6.1: `npm run build` - Compiled successfully
  - [x] 6.2: TypeScript `npx tsc --noEmit` - No errors
  - [x] 6.3: All shadcn/ui components have full TypeScript support

## Dev Notes

### Architecture Patterns and Constraints

**From architecture.md:**
- shadcn/ui component library (Radix UI primitives) - copy-paste architecture
- Tailwind CSS 3.x utility-first styling
- Dark mode default for 24/7 emergency operations
- High contrast, large click targets for reduced-light environments
- Desktop-first (quarter-screen 49" monitor viewport)

**From ux-design-specification.md:**
- Emergency Operations Dark theme selected (Theme 1)
- Color-coded status system: Red/Green/Amber for emergency services
- WCAG 2.1 Level AA accessibility compliance required
- Minimum 44×44px touch targets for primary actions

### Project Structure Notes

**From Story 1.1 and 1.2 learnings:**
- Project uses `app/` directory at root level (NOT inside `src/`)
- Import alias `@/*` maps to project root
- Tailwind CSS already partially configured (verify completeness)
- Components should go in `components/ui/` for shadcn/ui

**Key Files:**
- `tailwind.config.ts` - Theme configuration
- `postcss.config.js` - PostCSS configuration
- `app/globals.css` - Global styles and CSS variables
- `components.json` - shadcn/ui configuration
- `lib/utils.ts` - Utility functions (cn helper)
- `components/ui/` - shadcn/ui components directory

### Learnings from Previous Story

**From Story 1-2-database-schema-design-and-prisma-setup (Status: review)**

- **Prisma 6.19.0 installed**: Database foundation complete
- **Schema complete**: All 8 tables defined with relationships
- **lib/auth.ts updated**: Uses new User schema with `name` field
- **Build verified**: TypeScript, ESLint, and build all passing
- **No UI components yet**: This story creates the first UI foundation

[Source: .bmad-ephemeral/stories/1-2-database-schema-design-and-prisma-setup.md]

### References

**Technical Specification:**
- [Source: docs/stories/tech-spec-epic-1.md] - UI layer requirements
- [Source: docs/epics.md#Story 1.3] - Story definition lines 104-131

**Architecture Documentation:**
- [Source: docs/architecture.md] - Component architecture and styling approach

**UX Design:**
- [Source: docs/ux-design-specification.md] - Color palette, typography, spacing
- [Source: docs/ux-color-themes.html] - Visual theme reference

**PRD Reference:**
- UX Principles: High contrast, large click targets, minimal design
- Emergency-first design philosophy

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **2025-11-22**: Story 1.3 implementation completed
  - Tailwind CSS verified and enhanced with Emergency Services theme
  - shadcn/ui initialized with components.json
  - 9 core components installed: Button, Card, Input, Dialog, Tabs, Badge, Alert, Select, Textarea
  - Dark mode theme configured with slate-based colors from UX spec
  - Flash message animations added (flash-blink, message-pulse)
  - Viewport and fonts configured for quarter-screen deployment
  - Build and TypeScript verification passed

### File List

**Created:**
- components.json - shadcn/ui configuration
- components/ui/button.tsx
- components/ui/card.tsx
- components/ui/input.tsx
- components/ui/dialog.tsx
- components/ui/tabs.tsx
- components/ui/badge.tsx
- components/ui/alert.tsx
- components/ui/select.tsx
- components/ui/textarea.tsx

**Modified:**
- app/globals.css - Added dark mode CSS variables and emergency theme utilities
- app/layout.tsx - Added viewport config, fonts (Inter, JetBrains Mono)
- tailwind.config.ts - Added fontFamily, fontSize, semantic colors
