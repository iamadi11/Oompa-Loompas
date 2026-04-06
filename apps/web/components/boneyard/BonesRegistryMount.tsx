'use client'

import '@/bones/registry'

/** Side-effect import so pre-generated bones register before route-level skeletons render. */
export function BonesRegistryMount() {
  return null
}
