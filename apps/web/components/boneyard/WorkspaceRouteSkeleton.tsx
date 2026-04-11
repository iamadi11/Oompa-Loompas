'use client'

import { Skeleton } from 'boneyard-js/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

const fallbackClass =
  'min-h-[40vh] w-full rounded-2xl border border-line/60 bg-surface-raised/40 animate-pulse motion-reduce:animate-none'

export type WorkspaceSkeletonName =
  | 'workspace-dashboard'
  | 'workspace-deals'
  | 'workspace-deal-detail'
  | 'workspace-generic'

export function WorkspaceRouteSkeleton({ name }: { name: WorkspaceSkeletonName }) {
  const reduced = usePrefersReducedMotion()
  return (
    <Skeleton
      name={name}
      loading
      animate={reduced ? false : 'pulse'}
      color="rgba(120, 113, 108, 0.14)"
      darkColor="rgba(255, 255, 255, 0.07)"
      className="w-full"
      fallback={<div className={fallbackClass} role="status" aria-label="Loading" />}
    >
      <span className="sr-only">Loading</span>
    </Skeleton>
  )
}
