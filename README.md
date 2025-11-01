# 110 Sør-Vest Daily Operations Support System

Emergency operations support system for 110 Sør-Vest alarm center.

## Project Overview

This system provides daily operations support for emergency operators, including:
- **Flash Messages** - Urgent operator-to-operator communication
- **Bilstatus** - S111/S112 vehicle tracking and workload balancing
- **Daily Information Board** - Operational notices and important messages
- **Duty Roster** - Weekly personnel assignments
- **Bonfire Notification Map** - Public registration and operator verification system

Built with Next.js 14, TypeScript, Prisma, and Google OAuth.

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Google OAuth via NextAuth.js
- **Styling**: Tailwind CSS with shadcn/ui
- **Maps**: Google Maps API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20 LTS
- PostgreSQL database (cloud-hosted: Vercel Postgres, Supabase, or Neon)
- Google OAuth credentials
- Google Maps API key

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

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── ...                # Application pages
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
├── public/               # Static assets
└── types/                # TypeScript type definitions

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

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main` branch

## Documentation

- [Proposal](./proposal.md) - Complete project specification
- [Brainstorming Results](./docs/brainstorming-session-results-2025-11-01.md) - UX/UI design decisions

## Team

- **Developer (Application)**: [Your Name]
- **Developer (Landing Page)**: [Partner Name]
- **Institution**: IBE160 - Programmering med KI

## License

This project is developed as a student project for educational purposes.
