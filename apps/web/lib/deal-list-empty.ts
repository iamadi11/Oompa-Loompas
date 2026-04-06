/**
 * Copy for DealList when there are zero rows. Keeps “needs attention” filter
 * from misleading users with the global “no deals yet” message.
 */
export type DealListEmptyVariant = 'all' | 'needsAttention'

type AppPath = '/dashboard' | '/deals' | '/deals/new'

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
      title: "Nothing needs you right now",
      description:
        'No overdue payments or deliverables on your deals. Open the full list or capture a new commitment when you are ready.',
      primaryHref: '/deals',
      primaryLabel: 'View all deals',
      secondaryHref: '/dashboard',
      secondaryLabel: 'Back to overview',
    }
  }
  return {
    title: 'No deals yet',
    description: 'Record a brand commitment once — see value, milestones, and follow-ups in one place.',
    primaryHref: '/deals/new',
    primaryLabel: 'Add your first deal',
    secondaryHref: '/dashboard',
    secondaryLabel: 'Back to overview',
  }
}
