import { describe, expect, it } from 'vitest'
import { buildWebManifest } from '@/lib/manifest-config'

describe('buildWebManifest', () => {
  it('returns installable PWA manifest fields', () => {
    const m = buildWebManifest()
    expect(m.name).toBe('Oompa Loompas')
    expect(m.short_name).toBe('Oompa')
    expect(m.start_url).toBe('/')
    expect(m.display).toBe('standalone')
    expect(m.orientation).toBe('portrait-primary')
    expect(m.background_color).toBe('#0A0A0A')
    expect(m.theme_color).toBe('#0A0A0A')
    expect(m.description).toContain('creators')
  })

  it('includes any and maskable icons at 192 and 512', () => {
    const m = buildWebManifest()
    expect(m.icons).toHaveLength(4)
    const purposes = m.icons?.map((i) => i.purpose) ?? []
    expect(purposes.filter((p) => p === 'any')).toHaveLength(2)
    expect(purposes.filter((p) => p === 'maskable')).toHaveLength(2)
    expect(m.icons?.every((i) => i.type === 'image/png')).toBe(true)
    expect(m.icons?.some((i) => i.sizes === '192x192' && i.src.includes('192'))).toBe(true)
    expect(m.icons?.some((i) => i.sizes === '512x512' && i.src.includes('512'))).toBe(true)
  })
})
