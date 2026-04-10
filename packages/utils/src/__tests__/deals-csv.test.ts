import { describe, it, expect } from 'vitest'
import {
  buildDealsPortfolioCsv,
  escapeCsvCell,
  dealsPortfolioExportFilename,
  type DealPortfolioCsvRow,
} from '../deals-csv.js'

const baseRow: DealPortfolioCsvRow = {
  id: 'id-1',
  title: 'Campaign',
  brandName: 'Acme',
  status: 'DRAFT',
  value: 1000.5,
  currency: 'INR',
  startDate: '2026-04-01T00:00:00.000Z',
  endDate: null,
  notes: null,
  createdAt: '2026-04-04T00:00:00.000Z',
  updatedAt: '2026-04-04T00:00:00.000Z',
}

describe('escapeCsvCell', () => {
  it('returns plain text unchanged when no special chars', () => {
    expect(escapeCsvCell('hello')).toBe('hello')
  })

  it('wraps and doubles quotes when field contains comma', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
  })

  it('doubles internal quotes', () => {
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
  })

  it('wraps newlines', () => {
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"')
  })
})

describe('buildDealsPortfolioCsv', () => {
  it('outputs header and one row with CRLF and fixed decimals', () => {
    const csv = buildDealsPortfolioCsv([baseRow])
    expect(csv).toBe(
      [
        'deal_id,title,brand,status,contract_value,currency,start_date,end_date,created_at,updated_at,notes',
        'id-1,Campaign,Acme,DRAFT,1000.50,INR,2026-04-01T00:00:00.000Z,,2026-04-04T00:00:00.000Z,2026-04-04T00:00:00.000Z,',
      ].join('\r\n'),
    )
  })

  it('returns header only when no deals', () => {
    expect(buildDealsPortfolioCsv([])).toBe(
      'deal_id,title,brand,status,contract_value,currency,start_date,end_date,created_at,updated_at,notes',
    )
  })

  it('escapes title with comma', () => {
    const csv = buildDealsPortfolioCsv([{ ...baseRow, title: 'A, B' }])
    expect(csv.split('\r\n')[1]).toMatch(/^id-1,"A, B",/)
  })
})

describe('dealsPortfolioExportFilename', () => {
  it('uses UTC date prefix', () => {
    expect(dealsPortfolioExportFilename(new Date('2026-04-11T12:00:00.000Z'))).toBe(
      'oompa-deals-portfolio-2026-04-11.csv',
    )
  })
})
