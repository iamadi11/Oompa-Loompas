/**
 * Normalizes Next.js App Router `searchParams` values for the deals list filter.
 */
export function isDealsNeedsAttentionFilter(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const raw = firstSearchParamValue(searchParams['needsAttention'])
  return raw === 'true' || raw === '1'
}

function firstSearchParamValue(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value[0] : value
}
