import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from './client.js'

/**
 * Dev/local fixture data. Skips when any deal already exists (idempotent).
 * When the database has no deals, requires SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD
 * (see apps/api/.env.example). Run: `pnpm --filter @oompa/db db:seed`
 */
async function main(): Promise<void> {
  const existingDeals = await prisma.deal.count()
  if (existingDeals > 0) {
    console.info(`Seed skipped: ${existingDeals} deal(s) already in database`)
    return
  }

  const email = process.env['SEED_ADMIN_EMAIL']?.trim().toLowerCase()
  const password = process.env['SEED_ADMIN_PASSWORD']
  if (!email || !password) {
    console.error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required when there are no deals (see apps/api/.env.example).',
    )
    process.exitCode = 1
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      roles: ['ADMIN', 'MEMBER'],
    },
    update: {
      passwordHash,
      roles: ['ADMIN', 'MEMBER'],
    },
  })

  const deal = await prisma.deal.create({
    data: {
      userId: user.id,
      title: 'Sample campaign',
      brandName: 'Sample Brand',
      value: new Prisma.Decimal('100000'),
      currency: 'INR',
      status: 'DRAFT',
    },
  })

  await prisma.payment.create({
    data: {
      dealId: deal.id,
      amount: new Prisma.Decimal('50000'),
      currency: 'INR',
      status: 'PENDING',
      dueDate: new Date(),
    },
  })

  console.info('Seed complete: admin user + 1 deal + 1 payment milestone')
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
