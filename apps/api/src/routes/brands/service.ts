import type { UpsertBrandProfile } from '@oompa/types'

export type DbBrandProfile = {
  id: string
  userId: string
  brandName: string
  contactEmail: string | null
  contactPhone: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export function serializeBrandProfile(profile: DbBrandProfile) {
  return {
    id: profile.id,
    userId: profile.userId,
    brandName: profile.brandName,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    notes: profile.notes,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  }
}

export function toUpsertBrandProfileData(
  userId: string,
  brandName: string,
  data: UpsertBrandProfile,
) {
  return {
    userId,
    brandName,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
    notes: data.notes ?? null,
  }
}
