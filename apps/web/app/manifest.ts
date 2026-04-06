import type { MetadataRoute } from 'next'
import { buildWebManifest } from '@/lib/manifest-config'

export default function manifest(): MetadataRoute.Manifest {
  return buildWebManifest()
}
