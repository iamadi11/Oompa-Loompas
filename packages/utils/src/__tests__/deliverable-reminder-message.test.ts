import { describe, it, expect } from 'vitest'
import { buildDeliverableReminderMessage } from '../deliverable-reminder-message.js'

describe('buildDeliverableReminderMessage', () => {
  it('builds a message with all fields populated', () => {
    const msg = buildDeliverableReminderMessage({
      dealTitle: 'Brand Campaign Q1',
      brandName: 'Acme Co',
      deliverableTitle: 'Instagram Reel',
      dueDateIso: '2026-03-01T00:00:00.000Z',
    })
    expect(msg).toContain('Hi Acme Co,')
    expect(msg).toContain('"Brand Campaign Q1"')
    expect(msg).toContain('"Instagram Reel"')
    expect(msg).toContain('scheduled for')
  })

  it('uses generic greeting when brandName is empty', () => {
    const msg = buildDeliverableReminderMessage({
      dealTitle: 'Campaign',
      brandName: '',
      deliverableTitle: 'Reel',
      dueDateIso: null,
    })
    expect(msg).toMatch(/^Hi,/)
  })

  it('uses generic deal label when dealTitle is empty', () => {
    const msg = buildDeliverableReminderMessage({
      dealTitle: '',
      brandName: 'Brand',
      deliverableTitle: 'Video',
      dueDateIso: null,
    })
    expect(msg).toContain('our engagement')
  })

  it('uses generic deliverable label when deliverableTitle is empty', () => {
    const msg = buildDeliverableReminderMessage({
      dealTitle: 'Campaign',
      brandName: 'Brand',
      deliverableTitle: '',
      dueDateIso: null,
    })
    expect(msg).toContain('the deliverable')
  })

  it('omits due date sentence when dueDateIso is null', () => {
    const msg = buildDeliverableReminderMessage({
      dealTitle: 'Campaign',
      brandName: 'Brand',
      deliverableTitle: 'Post',
      dueDateIso: null,
    })
    expect(msg).not.toContain('scheduled for')
    // Message should still end with period
    expect(msg.split('\n\n')[1]).toMatch(/\.$/)
  })

  it('trims whitespace from all string inputs', () => {
    const msg = buildDeliverableReminderMessage({
      dealTitle: '  Campaign  ',
      brandName: '  Brand  ',
      deliverableTitle: '  Reel  ',
      dueDateIso: null,
    })
    expect(msg).toContain('Hi Brand,')
    expect(msg).toContain('"Campaign"')
    expect(msg).toContain('"Reel"')
  })
})
