import { describe, expect, it } from 'vitest'
import { LoginBodySchema, RoleSchema, Roles } from '../auth.js'
import { CurrencySchema, IdSchema, PaginationSchema, SortOrderSchema } from '../common.js'

describe('common schemas', () => {
  it('IdSchema accepts UUID v4', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000'
    expect(IdSchema.parse(id)).toBe(id)
  })

  it('IdSchema rejects non-UUID', () => {
    expect(() => IdSchema.parse('not-a-uuid')).toThrow()
  })

  it('CurrencySchema accepts supported codes', () => {
    expect(CurrencySchema.parse('USD')).toBe('USD')
  })

  it('CurrencySchema rejects unknown currency', () => {
    expect(() => CurrencySchema.parse('XYZ')).toThrow()
  })

  it('PaginationSchema applies defaults', () => {
    expect(PaginationSchema.parse({})).toEqual({ page: 1, limit: 20 })
  })

  it('PaginationSchema enforces bounds', () => {
    expect(() => PaginationSchema.parse({ page: 0 })).toThrow()
    expect(() => PaginationSchema.parse({ limit: 101 })).toThrow()
  })

  it('SortOrderSchema accepts asc and desc', () => {
    expect(SortOrderSchema.parse('asc')).toBe('asc')
    expect(SortOrderSchema.parse('desc')).toBe('desc')
  })
})

describe('auth schemas', () => {
  it('RoleSchema parses ADMIN and MEMBER', () => {
    expect(RoleSchema.parse('ADMIN')).toBe('ADMIN')
    expect(Roles.MEMBER).toBe('MEMBER')
  })

  it('LoginBodySchema accepts valid credentials', () => {
    expect(LoginBodySchema.parse({ email: 'a@b.co', password: 'secret' })).toEqual({
      email: 'a@b.co',
      password: 'secret',
    })
  })

  it('LoginBodySchema rejects invalid email', () => {
    expect(() => LoginBodySchema.parse({ email: 'not-email', password: 'x' })).toThrow()
  })

  it('LoginBodySchema rejects empty password', () => {
    expect(() => LoginBodySchema.parse({ email: 'a@b.co', password: '' })).toThrow()
  })
})
