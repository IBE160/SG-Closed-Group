# Supabase Migrations

This directory contains SQL migrations for the Supabase PostgreSQL database.

## Applying Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file and copy its contents
4. Paste into the SQL Editor and click **Run**

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (first time only)
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Direct PostgreSQL Connection

Using `psql` or any PostgreSQL client:

```bash
psql "your-database-url" -f supabase/migrations/20251211000000_enable_rls_all_tables.sql
```

## Migration History

| File | Description | Date |
|------|-------------|------|
| `20251211000000_enable_rls_all_tables.sql` | Enable RLS on all public tables to prevent unauthorized access via PostgREST | 2025-12-11 |

## Security Notes

- **Row Level Security (RLS)** is now enabled on all tables
- The `anon` role (public API key) has NO access to any tables
- The `service_role` (used by server-side Prisma) bypasses RLS and has full access
- All legitimate database operations should go through the Next.js API routes
