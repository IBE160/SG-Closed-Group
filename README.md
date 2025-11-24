# 110 Sør-Vest Daily Operations Support System

Emergency operations support system for 110 Sør-Vest alarm center.

## Project Overview

This system provides daily operations support for emergency operators, including:
- **Flash Messages** - Urgent operator-to-operator communication
- **Bilstatus** - S111/S112 vehicle tracking and workload balancing
- **Daily Information Board** - Operational notices and important messages
- **Duty Roster** - Weekly personnel assignments
- **Bonfire Notification Map** - Public registration and operator verification system
- **AI Chatbot** - Intelligent bonfire registration via natural language conversation (NEW!)

Built with Next.js 14, TypeScript, Prisma, and Google OAuth.

### ✨ NEW: AI-Powered Bonfire Registration

We've replaced the old Forms-based registration with an intelligent **AI chatbot** that:
- Collects information through natural Norwegian conversation
- Validates phone numbers in real-time (Norwegian 8-digit format)
- Verifies addresses using Google Maps Geocoding API
- Provides better user experience and higher data quality
- **Powered by AI** - Choose between:
  - **Azure OpenAI GPT-4o** (RECOMMENDED for production/student accounts)
  - **Claude 3.5 Haiku** (Alternative for quick testing)

📚 **Setup guides:**
- 👉 **[Azure OpenAI Setup](./AZURE_OPENAI_SETUP.md)** - Step-by-step for student accounts (RECOMMENDED)
- 👉 **[Anthropic Claude Setup](./CHATBOT_SETUP.md)** - Quick alternative
- 👉 **[Migration Guide](./MIGRATE_TO_AZURE.md)** - Switch from Claude to Azure

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Google OAuth via NextAuth.js
- **AI**: Azure OpenAI GPT-4o or Claude 3.5 Haiku (via Vercel AI SDK)
- **Styling**: Tailwind CSS with shadcn/ui
- **Maps**: Google Maps API (Geocoding & Maps JavaScript API)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 22.x or 24.x LTS
- PostgreSQL database (cloud-hosted: Vercel Postgres, Supabase, or Neon)
- Google OAuth credentials
- Google Maps API key (Geocoding API & Maps JavaScript API)
- **AI Provider** (choose one):
  - **Azure OpenAI** (RECOMMENDED) - Azure for Students ($100 free credit) → [Setup Guide](./AZURE_OPENAI_SETUP.md)
  - **Anthropic Claude** - $5 free credit → [Setup Guide](./CHATBOT_SETUP.md)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IBE160/SG-Closed-Group.git
cd SG-Closed-Group
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - http://localhost:3000 (dev) or your production URL
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - From Google Cloud Console
- **AI Provider** (choose one):
  - `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` - See [Azure Setup](./AZURE_OPENAI_SETUP.md)
  - `ANTHROPIC_API_KEY` - From https://console.anthropic.com

4. Run Prisma migrations:
```bash
npx prisma generate
npx prisma db push
```

5. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing the AI Chatbot

Visit **[http://localhost:3000/bonfire-registration](http://localhost:3000/bonfire-registration)** to test the AI-powered bonfire registration chatbot!

See **[CHATBOT_SETUP.md](./CHATBOT_SETUP.md)** for detailed setup instructions and testing scenarios.

## Project Structure

```
├── app/                              # Next.js App Router pages
│   ├── api/                         # API routes
│   │   ├── auth/                    # NextAuth endpoints
│   │   └── chat/bonfire/            # 🆕 AI chatbot API
│   ├── bonfire-registration/        # 🆕 Chatbot frontend
│   ├── auth/                        # Authentication pages
│   └── ...                          # Application pages
├── components/                      # React components
├── lib/                             # Utility functions and configurations
│   ├── prisma.ts                   # Prisma client
│   ├── auth.ts                     # NextAuth configuration
│   └── utils.ts                    # Helper functions
├── prisma/                          # Database schema and migrations
│   └── schema.prisma               # Prisma schema (includes BonfireNotification)
├── public/                          # Static assets
├── types/                           # TypeScript type definitions
├── CHATBOT_SETUP.md                # 🆕 Anthropic Claude setup guide
├── AZURE_OPENAI_SETUP.md           # 🆕 Azure OpenAI setup guide (RECOMMENDED)
├── MIGRATE_TO_AZURE.md             # 🆕 Migration guide: Claude → Azure
└── .env.example                    # 🆕 Environment variables template

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database Management

- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply migrations

## Git Workflow

This project uses a branch-based workflow:

- `main` - Production-ready code
- `dev-application` - Application development (your work)
- `dev-landing` - Landing page development (partner's work)
- `integration` - Integration testing before merging to main

### Working on Features

1. Create feature branch from `dev-application`:
```bash
git checkout dev-application
git checkout -b feature/your-feature-name
```

2. Commit your changes:
```bash
git add .
git commit -m "Description of changes"
```

3. Push and merge back to `dev-application`:
```bash
git push origin feature/your-feature-name
git checkout dev-application
git merge feature/your-feature-name
git push origin dev-application
```

## Deployment

The application is deployed on **Vercel** with automatic deployments.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/IBE160/SG-Closed-Group)

### Manual Deployment Setup

1. **Connect Repository to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project" → Import your repository
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Configure Environment Variables** (in Vercel Dashboard → Settings → Environment Variables):

   | Variable | Description | Scope |
   |----------|-------------|-------|
   | `DATABASE_URL` | PostgreSQL connection string | Production, Preview |
   | `NEXTAUTH_URL` | Production URL (e.g., https://sg-closed-group.vercel.app) | Production |
   | `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` | Production, Preview |
   | `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Production, Preview |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Production, Preview |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API Key | Production, Preview |

3. **Database Setup (Vercel Postgres):**
   - In Vercel Dashboard → Storage → Create Database → Postgres
   - Copy the `POSTGRES_PRISMA_URL` to `DATABASE_URL`
   - Run migration: `npx prisma migrate deploy`

4. **Deploy:**
   - Push to `main` branch for production deployment
   - Push to any other branch for preview deployment

### Deployment URLs

- **Production:** Deployed on merge to `main`
- **Preview:** Deployed on push to feature branches
- **Custom Domain:** Configure in Vercel Dashboard → Settings → Domains

## Documentation

- [Proposal](./proposal.md) - Complete project specification
- [Brainstorming Results](./docs/brainstorming-session-results-2025-11-01.md) - UX/UI design decisions

## Team

- **Developer (Application)**: [Your Name]
- **Developer (Landing Page)**: [Partner Name]
- **Institution**: IBE160 - Programmering med KI

## License

This project is developed as a student project for educational purposes.
