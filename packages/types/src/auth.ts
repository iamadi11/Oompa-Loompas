import { z } from 'zod'

export const RoleSchema = z.enum(['ADMIN', 'MEMBER'])
export type Role = z.infer<typeof RoleSchema>

export const Roles = RoleSchema.enum

export interface AuthUser {
  id: string
  email: string
  roles: Role[]
}

export const LoginBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(1024),
})
export type LoginBody = z.infer<typeof LoginBodySchema>

export const RegisterBodySchema = z.object({
  email: z.string().email('Invalid email address').max(320),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})
export type RegisterBody = z.infer<typeof RegisterBodySchema>

export interface MeResponse {
  data: AuthUser
}
