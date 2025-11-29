// Script to add first admin user
// Usage: npx ts-node scripts/add-admin.ts your.email@example.com

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx ts-node scripts/add-admin.ts your.email@example.com')
    process.exit(1)
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      whitelisted: true,
      role: 'ADMINISTRATOR',
    },
    create: {
      email,
      name: 'Administrator',
      whitelisted: true,
      role: 'ADMINISTRATOR',
    },
  })

  console.log('✅ Admin user created/updated:')
  console.log(`   Email: ${user.email}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Whitelisted: ${user.whitelisted}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
