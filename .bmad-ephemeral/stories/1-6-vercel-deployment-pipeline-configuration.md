# Story 1.6: Vercel Deployment Pipeline Configuration

Status: ready-for-dev

## Story

As a developer,
I want to configure continuous deployment to Vercel,
So that every Git push automatically deploys to a preview or production environment.

## Acceptance Criteria

1. **AC-1.6.1:** Vercel automatically builds and deploys the application on Git push
2. **AC-1.6.2:** Preview deployments are created for non-main branches
3. **AC-1.6.3:** Production deployment occurs on merge to main branch
4. **AC-1.6.4:** Environment variables are configured in Vercel dashboard
5. **AC-1.6.5:** Build succeeds and application is accessible via HTTPS
6. **AC-1.6.6:** Custom domain is configured (if available)

## Tasks / Subtasks

- [ ] **Task 1: Connect Git Repository to Vercel** (AC: 1.6.1, 1.6.2, 1.6.3)
  - [ ] 1.1: Create Vercel account or use existing (team account if available)
  - [ ] 1.2: Import Git repository (GitHub) into Vercel project
  - [ ] 1.3: Configure build settings: Framework Preset = Next.js, Build Command = `npm run build`
  - [ ] 1.4: Verify Git integration detects branches and triggers builds

- [ ] **Task 2: Configure Environment Variables** (AC: 1.6.4)
  - [ ] 2.1: Add `DATABASE_URL` (Vercel Postgres or external PostgreSQL connection string)
  - [ ] 2.2: Add `NEXTAUTH_URL` (production URL, e.g., https://app.vercel.app)
  - [ ] 2.3: Add `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
  - [ ] 2.4: Add placeholder for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (Epic 2)
  - [ ] 2.5: Add placeholder for `GOOGLE_MAPS_API_KEY` (Epic 5)
  - [ ] 2.6: Add placeholder for Azure OpenAI variables (Epic 5)
  - [ ] 2.7: Configure environment scope: Production, Preview, Development

- [ ] **Task 3: Verify Deployment Pipeline** (AC: 1.6.1, 1.6.5)
  - [ ] 3.1: Push a commit to main branch and verify production deployment triggers
  - [ ] 3.2: Create a feature branch, push commit, verify preview deployment creates
  - [ ] 3.3: Verify build output shows successful compilation
  - [ ] 3.4: Access deployed URL and verify application loads correctly
  - [ ] 3.5: Verify HTTPS/SSL is automatically configured

- [ ] **Task 4: Configure Vercel Project Settings** (AC: 1.6.5, 1.6.6)
  - [ ] 4.1: Set Node.js version to match local development (v22.x or LTS)
  - [ ] 4.2: Configure build timeout (default 45 minutes should be sufficient)
  - [ ] 4.3: Enable/configure Vercel Analytics (optional)
  - [ ] 4.4: Add custom domain if available (optional)
  - [ ] 4.5: Configure domain redirect settings (www vs non-www)

- [ ] **Task 5: Test Database Connectivity** (AC: 1.6.4, 1.6.5)
  - [ ] 5.1: If using Vercel Postgres, create database in Vercel dashboard
  - [ ] 5.2: Run `npx prisma migrate deploy` to apply migrations to production database
  - [ ] 5.3: Verify Prisma Client can connect in deployed environment
  - [ ] 5.4: Test basic database operation (e.g., page load that queries database)

- [ ] **Task 6: Document Deployment Configuration** (AC: all)
  - [ ] 6.1: Update README.md with deployment instructions
  - [ ] 6.2: Document environment variables required (without secrets)
  - [ ] 6.3: Add deployment URL to project documentation

## Dev Notes

### Architecture Patterns and Constraints

**From architecture.md:**
- Vercel deployment for Next.js applications
- Serverless architecture (Vercel Functions)
- Edge network for static assets
- Automatic HTTPS/SSL certificates
- Preview deployments for branch-based development

**From PRD:**
- Platform: Vercel (free tier sufficient for 4-6 concurrent users)
- NFR: System Uptime > 99% within business hours
- NFR: Page Load < 2 seconds (Vercel edge network helps)

### Project Structure Notes

**Build Configuration:**
- Framework: Next.js 14 with App Router
- Build command: `npm run build`
- Output: Standalone mode (configured in next.config.mjs)
- Node.js: v22.x (or LTS version supported by Vercel)

**Environment Variables Required:**
```
# Database
DATABASE_URL=postgresql://...

# NextAuth.js
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generated-secret>

# Google OAuth (Epic 2)
GOOGLE_CLIENT_ID=<placeholder>
GOOGLE_CLIENT_SECRET=<placeholder>

# Google Maps (Epic 5)
GOOGLE_MAPS_API_KEY=<placeholder>

# Azure OpenAI (Epic 5)
AZURE_OPENAI_ENDPOINT=<placeholder>
AZURE_OPENAI_KEY=<placeholder>
```

### Learnings from Previous Story

**From Story 1-5-hva-skjer-folder-layout-structure (Status: done)**

- **Build Verified**: `npm run build` compiles successfully with 8 routes
- **Route Structure**: All 4 folder routes exist (/hva-skjer, /flash, /balmelding, /innstillinger)
- **Layout Working**: Three-panel layout for "Hva Skjer" operational view functional
- **Components Created**: Tab navigation, layout components all working
- **Dark Mode**: Emergency services dark theme active

[Source: .bmad-ephemeral/stories/1-5-hva-skjer-folder-layout-structure.md#Dev-Agent-Record]

**Key Files Ready for Deployment:**
- `app/layout.tsx` - Root layout with AppLayout wrapper
- `app/hva-skjer/page.tsx` - Primary operational view
- `components/` - All UI components created in Epic 1

### References

**Technical Specification:**
- [Source: docs/epics.md#Story 1.6] - Story definition lines 194-226

**Architecture Documentation:**
- [Source: docs/architecture.md] - Deployment architecture and Vercel configuration

**PRD Reference:**
- Platform: Vercel deployment
- NFR: System Uptime, Performance (page load < 2 seconds)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
