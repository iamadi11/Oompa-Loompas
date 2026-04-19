import { vi } from 'vitest'

export const prisma = {
  user: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  deal: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  payment: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  brandProfile: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
  deliverable: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  invoiceCounter: {
    upsert: vi.fn().mockResolvedValue({ id: 'singleton', lastSeq: 1 }),
  },
  pushSubscription: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
  dealTemplate: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  dealTemplateDeliverable: {
    deleteMany: vi.fn(),
  },
  dealTemplatePayment: {
    deleteMany: vi.fn(),
  },
  $executeRaw: vi.fn().mockResolvedValue(undefined),
  $queryRaw: vi.fn().mockResolvedValue([{ ok: 1 }]),
  $transaction: vi.fn(),
}

prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) =>
  Promise.resolve(fn(prisma)),
)

export const Prisma = {
  Decimal: class Decimal {
    val: number
    constructor(v: number | string) {
      this.val = Number(v)
    }
    toNumber() {
      return this.val
    }
    toString() {
      return String(this.val)
    }
  },
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
}
