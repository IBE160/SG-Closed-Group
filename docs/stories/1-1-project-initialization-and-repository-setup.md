# Story 1.1: Project Initialization and Repository Setup

Status: drafted

## Story

As a developer,
I want to initialize the Next.js 14 project with TypeScript and core dependencies,
so that I have a working development environment to build features.

## Acceptance Criteria

1. **AC-1.1.1:** Next.js 14 project initialized with App Router, TypeScript, ESLint, and Prettier configured
2. **AC-1.1.2:** Project runs successfully on `localhost:3000` with no errors in browser console
3. **AC-1.1.3:** Git repository initialized with proper `.gitignore` for Node.js, Next.js, and environment variables
4. **AC-1.1.4:** README.md contains project overview and setup instructions
5. **AC-1.1.5:** Environment variable template (`.env.example`) created with placeholder values
6. **AC-1.1.6:** All core dependencies installed: `react`, `next`, `typescript`, and type definitions
7. **AC-1.1.7:** `next.config.js` configured for production deployment

## Tasks / Subtasks

- [ ] **Task 1:** Initialize Next.js 14 project with TypeScript (AC: #1, #2, #6)
  - [ ] Run `npx create-next-app@latest hva-skjer --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [ ] Verify project structure created with `src/` directory and App Router
  - [ ] Install additional type definitions: `@types/node`, `@types/react`, `@types/react-dom`
  - [ ] Run `npm run dev` and verify `localhost:3000` loads without errors
  - [ ] Check browser console for any warnings or errors

- [ ] **Task 2:** Configure Git repository (AC: #3)
  - [ ] Initialize Git: `git init`
  - [ ] Verify `.gitignore` includes: `node_modules/`, `.next/`, `.env*`, `*.log`
  - [ ] Add entries for: `out/`, `.DS_Store`, `*.pem`, `.vercel`
  - [ ] Create initial commit with message: "Initial Next.js 14 project setup"

- [ ] **Task 3:** Create environment variable template (AC: #5)
  - [ ] Create `.env.example` file with placeholders
  - [ ] Add entries for: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_MAPS_API_KEY`, `AZURE_OPENAI_*`
  - [ ] Add comments explaining each variable's purpose
  - [ ] Verify `.env.example` is tracked by Git, but `.env.local` is gitignored

- [ ] **Task 4:** Configure Next.js for production (AC: #7)
  - [ ] Create/update `next.config.mjs` with production settings
  - [ ] Enable strict mode: `reactStrictMode: true`
  - [ ] Configure image optimization domains (if needed)
  - [ ] Add any required experimental features for App Router

- [ ] **Task 5:** Create comprehensive README.md (AC: #4)
  - [ ] Add project title: "Hva Skjer - Emergency Response Application"
  - [ ] Write project overview (2-3 paragraphs from PRD executive summary)
  - [ ] Add prerequisites: Node.js 22.x or 24.x LTS, npm/yarn
  - [ ] Document setup instructions:
    - Clone repository
    - Copy `.env.example` to `.env.local`
    - Run `npm install`
    - Run `npm run dev`
    - Open `http://localhost:3000`
  - [ ] Add technology stack section (Next.js 14, TypeScript, Tailwind, etc.)
  - [ ] Include link to full documentation in `docs/` folder

- [ ] **Task 6:** Verify and test complete setup (All ACs)
  - [ ] Clean install test: Delete `node_modules`, run `npm install`, verify success
  - [ ] Dev server test: Run `npm run dev`, verify `localhost:3000` accessible
  - [ ] Build test: Run `npm run build`, verify production build succeeds
  - [ ] Type check: Run `npm run type-check` (or `tsc --noEmit`), verify no errors
  - [ ] Lint check: Run `npm run lint`, verify no errors
  - [ ] Review browser console for any warnings or errors
  - [ ] Verify Git status shows clean working directory after initial commit

## Dev Notes

### Architecture Alignment

From [docs/architecture.md#Project-Initialization](../architecture.md):

**Required initialization command:**
```bash
npx create-next-app@latest hva-skjer --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

This establishes:
- ✅ Next.js 14 with App Router - Modern routing architecture
- ✅ TypeScript - Type safety for all code
- ✅ Tailwind CSS - Utility-first styling (pre-configured)
- ✅ ESLint - Code quality and consistency
- ✅ src/ directory structure - Organized code layout
- ✅ @/* import alias - Clean import paths

**Environment Variables to Prepare:**
- `DATABASE_URL` - Vercel Postgres connection (Story 1.2)
- `NEXTAUTH_URL` - Application URL for NextAuth.js (Epic 2)
- `NEXTAUTH_SECRET` - JWT signing secret (Epic 2)
- `GOOGLE_CLIENT_ID` - Google OAuth credentials (Epic 2)
- `GOOGLE_CLIENT_SECRET` - Google OAuth credentials (Epic 2)
- `GOOGLE_MAPS_API_KEY` - Google Maps integration (Epic 5)
- `AZURE_OPENAI_ENDPOINT` - AI email parsing (Epic 5)
- `AZURE_OPENAI_API_KEY` - AI email parsing (Epic 5)
- `AZURE_OPENAI_DEPLOYMENT` - GPT-4o deployment name (Epic 5)

### Project Structure Notes

**Expected folder structure after initialization:**
```
hva-skjer/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page (will redirect to /hva-skjer)
│   │   └── globals.css      # Global styles
│   └── components/          # Will be created in Story 1.3
├── public/                  # Static assets
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

**Alignment with Tech Spec:**
- Uses `src/` directory for cleaner organization
- App Router (`app/` directory) for modern Next.js routing
- Import alias `@/*` maps to `src/*` for clean imports
- TypeScript strict mode enabled in `tsconfig.json`

### Testing Strategy

**Story 1.1 Testing:**
- **Manual Verification:** Primary test method for initialization
- **Smoke Tests:** Dev server loads, build succeeds, no console errors
- **Checklist Verification:** All ACs met before marking story complete

**No automated tests required for this story** - initialization is one-time setup verified through successful execution of subsequent stories.

### Technical Constraints

**Node.js Version:**
- Required: Node.js 22.x or 24.x LTS (from architecture decision summary)
- Verify with: `node --version`
- If wrong version, update before initialization

**Package Manager:**
- Use `npm` (bundled with Node.js)
- Alternative: `yarn` or `pnpm` acceptable
- Lock file: Commit `package-lock.json` to Git

**Next.js Version:**
- Must be 14.x (App Router required)
- Verify in `package.json`: `"next": "^14.0.0"`

### Risks and Mitigations

**Risk: Create-Next-App Version Mismatch**
- **Mitigation:** Use `@latest` flag to ensure Next.js 14
- **Verification:** Check `package.json` after initialization

**Risk: Node Version Incompatibility**
- **Mitigation:** Verify Node.js version before initialization
- **Fallback:** Use `nvm` to switch Node versions if needed

**Risk: Missing TypeScript Configuration**
- **Mitigation:** Create-next-app includes TypeScript setup automatically
- **Verification:** Confirm `tsconfig.json` exists with strict mode enabled

### References

- **PRD:** [docs/PRD.md#Project-Classification](../PRD.md) - Emergency services application context
- **Architecture:** [docs/architecture.md#Project-Initialization](../architecture.md) - Initialization command and stack details
- **Architecture:** [docs/architecture.md#Technology-Stack-Details](../architecture.md) - Core dependencies and versions
- **Tech Spec:** [docs/stories/tech-spec-epic-1.md#Services-and-Modules](tech-spec-epic-1.md) - Epic 1 foundation requirements
- **Tech Spec:** [docs/stories/tech-spec-epic-1.md#Dependencies-and-Integrations](tech-spec-epic-1.md) - Complete dependency list

### Learnings from Previous Story

**First story in Epic 1 - no predecessor context**

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- To be filled during dev-story workflow -->

### Debug Log References

<!-- To be filled during dev-story workflow -->

### Completion Notes List

<!-- To be filled during dev-story workflow -->

### File List

<!-- To be filled during dev-story workflow -->
