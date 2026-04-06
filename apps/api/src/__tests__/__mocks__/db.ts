import { vi } from 'vitest'

export const prisma = {
  user: {
    findUnique: vi.fn(),
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
  },
  payment: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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
