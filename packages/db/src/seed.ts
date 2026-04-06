import { Prisma } from '@prisma/client'
import { prisma } from './client.js'

/**
 * Dev/local fixture data. Skips when any deal already exists (idempotent).
 * Run: `pnpm --filter @oompa/db db:seed` (loads `apps/api/.env` for `DATABASE_URL`).
 */
async function main(): Promise<void> {
  const existing = await prisma.deal.count()
  if (existing > 0) {
    console.info(`Seed skipped: ${existing} deal(s) already in database`)
    return
  }

  const deal = await prisma.deal.create({
    data: {
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

  console.info('Seed complete: 1 deal + 1 payment milestone')
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
