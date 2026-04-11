import { describe, expect, it } from 'vitest'
import { serializeBrandProfile } from './service.js'

describe('brands service helpers', () => {
  it('serializes date fields to ISO strings', () => {
    const out = serializeBrandProfile({
      id: '1',
      userId: 'u1',
      brandName: 'Acme',
      contactEmail: 'a@b.com',
      contactPhone: '+1 555 000',
      notes: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    })
    expect(out.createdAt).toBe('2024-01-01T00:00:00.000Z')
    expect(out.updatedAt).toBe('2024-01-02T00:00:00.000Z')
  })

  it('serializes nullable contact fields', () => {
    const out = serializeBrandProfile({
      id: '2',
      userId: 'u1',
      brandName: 'B',
      contactEmail: null,
      contactPhone: null,
      notes: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })
    expect(out.contactEmail).toBeNull()
    expect(out.contactPhone).toBeNull()
    expect(out.notes).toBeNull()
  })

  it('preserves brandName, contactEmail, and notes', () => {
    const out = serializeBrandProfile({
      id: '3',
      userId: 'u1',
      brandName: 'Test Brand & Co.',
      contactEmail: 'hi@testbrand.com',
      contactPhone: null,
      notes: 'Great client — pays on time',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })
    expect(out.brandName).toBe('Test Brand & Co.')
    expect(out.contactEmail).toBe('hi@testbrand.com')
    expect(out.notes).toBe('Great client — pays on time')
  })

  it('includes all expected fields', () => {
    const out = serializeBrandProfile({
      id: 'abc',
      userId: 'u2',
      brandName: 'X',
      contactEmail: null,
      contactPhone: null,
      notes: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })
    expect(out).toHaveProperty('id', 'abc')
    expect(out).toHaveProperty('userId', 'u2')
    expect(out).toHaveProperty('brandName', 'X')
    expect(out).toHaveProperty('contactEmail')
    expect(out).toHaveProperty('contactPhone')
    expect(out).toHaveProperty('notes')
    expect(out).toHaveProperty('createdAt')
    expect(out).toHaveProperty('updatedAt')
  })
})
