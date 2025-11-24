import { PrismaClient } from '@prisma/client'
import { createAuditedPrismaClient } from './audit'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createAuditedPrismaClient> | undefined
  auditPrisma: PrismaClient | undefined
}

// Create a separate Prisma client for audit operations (to avoid extension recursion)
const createAuditPrismaClient = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null as unknown as PrismaClient;
  }

  return new PrismaClient({
    log: ['error'],
  });
};

// Only instantiate Prisma Client if not in build phase
const createPrismaClient = () => {
  // Skip Prisma during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null as unknown as ReturnType<typeof createAuditedPrismaClient>;
  }

  const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Get or create audit Prisma client
  const auditClient = globalForPrisma.auditPrisma ?? createAuditPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.auditPrisma = auditClient;
  }

  // Create extended Prisma client with audit logging
  const extendedClient = createAuditedPrismaClient(basePrisma, auditClient);

  console.info('[PRISMA]', 'Audit extension enabled', {
    timestamp: new Date().toISOString(),
  });

  return extendedClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
