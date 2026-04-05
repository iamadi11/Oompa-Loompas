import type { DashboardSummary } from '@oompa/types'

export type HomeOverviewState =
  | { kind: 'unavailable' }
  | { kind: 'empty' }
  | { kind: 'ready'; data: DashboardSummary }

/**
 * Separates “dashboard unavailable” (network/API) from “no deals yet”.
 * Conflating the two misleads creators into thinking their revenue data is empty.
 */
export function resolveHomeOverviewState(
  data: DashboardSummary | null | undefined
): HomeOverviewState {
  if (data == null) {
    return { kind: 'unavailable' }
  }
  if (data.totalDealsCount === 0) {
    return { kind: 'empty' }
  }
  return { kind: 'ready', data }
}
