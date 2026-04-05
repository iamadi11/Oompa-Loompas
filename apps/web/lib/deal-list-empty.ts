/**
 * Copy for DealList when there are zero rows. Keeps “needs attention” filter
 * from misleading users with the global “no deals yet” message.
 */
export type DealListEmptyVariant = 'all' | 'needsAttention'

type AppPath = '/' | '/deals' | '/deals/new'

export type DealListEmptyContent = {
  title: string
  description: string
  primaryHref: AppPath
  primaryLabel: string
  secondaryHref: AppPath
  secondaryLabel: string
}

export function getDealListEmptyContent(variant: DealListEmptyVariant): DealListEmptyContent {
  if (variant === 'needsAttention') {
    return {
      title: "You're all caught up",
      description:
        'No deals have overdue payments or deliverables right now. Check all deals or add a new one anytime.',
      primaryHref: '/deals',
      primaryLabel: 'View all deals',
      secondaryHref: '/',
      secondaryLabel: 'Back to overview',
    }
  }
  return {
    title: 'No deals yet',
    description: 'Add your first brand deal to start tracking revenue.',
    primaryHref: '/deals/new',
    primaryLabel: 'Add deal',
    secondaryHref: '/',
    secondaryLabel: 'Back to overview',
  }
}
