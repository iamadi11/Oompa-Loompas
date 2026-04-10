import { describe, it, expect } from 'vitest'
import {
  attentionQueueExportFilename,
  buildAttentionQueueCsv,
  type AttentionQueueCsvRow,
} from '../attention-csv.js'

const paymentRow: AttentionQueueCsvRow = {
  kind: 'overdue_payment',
  dealId: 'd1',
  dealTitle: 'Campaign',
  brandName: 'Nike',
  paymentId: 'p1',
  paymentAmount: 5000,
  paymentCurrency: 'INR',
  deliverableId: '',
  deliverableTitle: '',
  dueDate: '2026-03-01T00:00:00.000Z',
}

const deliverableRow: AttentionQueueCsvRow = {
  kind: 'overdue_deliverable',
  dealId: 'd1',
  dealTitle: 'Campaign',
  brandName: 'Nike',
  paymentId: '',
  paymentAmount: null,
  paymentCurrency: null,
  deliverableId: 'del-1',
  deliverableTitle: 'Reel draft',
  dueDate: '2026-03-15T00:00:00.000Z',
}

describe('buildAttentionQueueCsv', () => {
  it('outputs header and rows', () => {
    const csv = buildAttentionQueueCsv([paymentRow, deliverableRow])
    const lines = csv.split('\r\n')
    expect(lines[0]).toContain('priority_kind,deal_id')
    expect(lines[1]).toContain('overdue_payment')
    expect(lines[1]).toContain('p1')
    expect(lines[1]).toContain('5000.00')
    expect(lines[2]).toContain('overdue_deliverable')
    expect(lines[2]).toContain('del-1')
    expect(lines[2]).toContain('Reel draft')
  })

  it('header only when empty', () => {
    expect(buildAttentionQueueCsv([]).split('\r\n').length).toBe(1)
  })

  it('escapes deal title with comma', () => {
    const line = buildAttentionQueueCsv([
      { ...paymentRow, dealTitle: 'A, B' },
    ]).split('\r\n')[1]
    expect(line).toContain('"A, B"')
  })
})

describe('attentionQueueExportFilename', () => {
  it('uses UTC date', () => {
    expect(attentionQueueExportFilename(new Date('2026-04-11T00:00:00.000Z'))).toBe(
      'oompa-attention-queue-2026-04-11.csv',
    )
  })
})
