import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only instantiate Prisma Client if not in build phase
const createPrismaClient = () => {
  // Skip Prisma during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null as unknown as PrismaClient;
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
