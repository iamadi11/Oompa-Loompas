import { describe, it, expect } from 'vitest'
import { buildFollowupEmail } from '../payment-followup-email.js'
import type { FollowupEmailItem } from '../payment-followup-email.js'

const item3d: FollowupEmailItem = {
  paymentId: 'pay-1',
  dealId: 'deal-1',
  dealTitle: 'Nike Q1 Reel',
  brandName: 'Nike',
  amount: 50000,
  currency: 'INR',
  dueDateIso: '2026-04-22',
  dayThreshold: 3,
}

const item7d: FollowupEmailItem = {
  ...item3d,
  paymentId: 'pay-2',
  brandName: 'Adidas',
  dayThreshold: 7,
}

const item14d: FollowupEmailItem = {
  ...item3d,
  paymentId: 'pay-3',
  brandName: 'Puma',
  dayThreshold: 14,
}

describe('buildFollowupEmail', () => {
  it('subject: 3-day single item', () => {
    const { subject } = buildFollowupEmail([item3d], 'https://app.oompa')
    expect(subject).toMatch(/follow.?up/i)
    expect(subject).toMatch(/3 day/i)
  })

  it('subject: 7-day single item', () => {
    const { subject } = buildFollowupEmail([item7d], 'https://app.oompa')
    expect(subject).toMatch(/urgent/i)
    expect(subject).toMatch(/1 week|7 day/i)
  })

  it('subject: 14-day single item', () => {
    const { subject } = buildFollowupEmail([item14d], 'https://app.oompa')
    expect(subject).toMatch(/action needed|final|2 week|14 day/i)
  })

  it('subject uses highest threshold in mixed batch', () => {
    const { subject } = buildFollowupEmail([item3d, item14d, item7d], 'https://app.oompa')
    // 14d is highest — subject should reflect that urgency
    expect(subject).toMatch(/action needed|final|2 week|14 day/i)
  })

  it('html contains brand name', () => {
    const { html } = buildFollowupEmail([item3d], 'https://app.oompa')
    expect(html).toContain('Nike')
  })

  it('html escapes brand name with special chars', () => {
    const malicious: FollowupEmailItem = { ...item3d, brandName: '<script>alert(1)</script>' }
    const { html } = buildFollowupEmail([malicious], 'https://app.oompa')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('html contains formatted amount', () => {
    const { html } = buildFollowupEmail([item3d], 'https://app.oompa')
    expect(html).toContain('50,000')
  })

  it('html contains link to attention page', () => {
    const { html } = buildFollowupEmail([item3d], 'https://app.oompa')
    expect(html).toContain('https://app.oompa/attention')
  })

  it('html contains link to settings', () => {
    const { html } = buildFollowupEmail([item3d], 'https://app.oompa')
    expect(html).toContain('https://app.oompa/settings')
  })

  it('plain text fallback contains brand name and amount', () => {
    const { text } = buildFollowupEmail([item3d], 'https://app.oompa')
    expect(text).toContain('Nike')
    expect(text).toContain('50,000')
  })

  it('14d item appears before 3d item in html (most urgent first)', () => {
    const { html } = buildFollowupEmail([item3d, item14d], 'https://app.oompa')
    const idx14 = html.indexOf('Puma') // item14d brandName
    const idx3 = html.indexOf('Nike') // item3d brandName
    expect(idx14).toBeLessThan(idx3)
  })

  it('renders correctly with null dueDate', () => {
    const noDue: FollowupEmailItem = { ...item3d, dueDateIso: null }
    const { html, text } = buildFollowupEmail([noDue], 'https://app.oompa')
    expect(html).toContain('Nike')
    expect(text).toContain('Nike')
  })

  it('includes reminder text in html', () => {
    const { html } = buildFollowupEmail([item3d], 'https://app.oompa')
    // The pre-composed reminder text uses "Following up" phrasing
    expect(html).toMatch(/following up|outstanding|overdue/i)
  })
})
