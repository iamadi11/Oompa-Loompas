import { describe, it, expect } from 'vitest'
import {
  buildDeliverablesPortfolioCsv,
  deliverablesPortfolioExportFilename,
  type DeliverablePortfolioCsvRow,
} from '../deliverables-csv.js'

const base: DeliverablePortfolioCsvRow = {
  deliverableId: 'del-1',
  dealId: 'deal-1',
  dealTitle: 'Spring',
  brandName: 'Acme',
  title: 'Reel',
  platform: 'INSTAGRAM',
  type: 'REEL',
  status: 'PENDING',
  dueDate: '2026-05-01T00:00:00.000Z',
  completedAt: null,
  notes: null,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
}

describe('buildDeliverablesPortfolioCsv', () => {
  it('outputs header and row', () => {
    const csv = buildDeliverablesPortfolioCsv([base])
    expect(csv).toContain('deliverable_id,deal_id')
    expect(csv).toContain('del-1')
    expect(csv).toContain('INSTAGRAM')
  })

  it('header only when empty', () => {
    expect(buildDeliverablesPortfolioCsv([]).split('\r\n').length).toBe(1)
  })

  it('escapes deliverable title with comma', () => {
    const line = buildDeliverablesPortfolioCsv([{ ...base, title: 'A, B' }]).split('\r\n')[1]
    expect(line).toContain('"A, B"')
  })
})

describe('deliverablesPortfolioExportFilename', () => {
  it('uses UTC date', () => {
    expect(deliverablesPortfolioExportFilename(new Date('2026-04-13T00:00:00.000Z'))).toBe(
      'oompa-deliverables-portfolio-2026-04-13.csv',
    )
  })
})
