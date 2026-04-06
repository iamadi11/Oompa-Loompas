import { prisma } from '@oompa/db'

/**
 * Returns the deal id if it exists and belongs to the user; otherwise null.
 */
export async function findDealIdForUser(
  dealId: string,
  userId: string,
): Promise<string | null> {
  const row = await prisma.deal.findFirst({
    where: { id: dealId, userId },
    select: { id: true },
  })
  return row?.id ?? null
}
