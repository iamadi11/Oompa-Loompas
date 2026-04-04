import { vi } from 'vitest'

export const prisma = {
  deal: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
}

export const Prisma = {
  Decimal: class Decimal {
    private val: number
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
}
