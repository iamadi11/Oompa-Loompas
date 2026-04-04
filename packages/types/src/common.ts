import { z } from 'zod'

export const IdSchema = z.string().uuid()
export type Id = z.infer<typeof IdSchema>

export const CurrencySchema = z.enum(['INR', 'USD', 'EUR', 'GBP'])
export type Currency = z.infer<typeof CurrencySchema>

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})
export type Pagination = z.infer<typeof PaginationSchema>

export const SortOrderSchema = z.enum(['asc', 'desc'])
export type SortOrder = z.infer<typeof SortOrderSchema>

export interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}
