/**
 * Determines whether a main shell nav item is the current page for `aria-current="page"`.
 */
export type MainNavTarget = 'overview' | 'attention' | 'deals'

export function isMainNavCurrent(pathname: string, target: MainNavTarget): boolean {
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  switch (target) {
    case 'overview':
      return normalized === '/dashboard' || normalized.startsWith('/dashboard/')
    case 'attention':
      return normalized === '/attention' || normalized.startsWith('/attention/')
    case 'deals':
      return normalized === '/deals' || normalized.startsWith('/deals/')
  }
}
