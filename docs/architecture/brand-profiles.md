# Architecture: Brand Profiles

## Module
Deal (brand identity is anchored to deals; profiles enrich but don't replace deal.brandName)

## Data Flow
Input → Validate (UpsertBrandProfileSchema) → Normalize (trim) → Upsert (Prisma @@unique userId+brandName) → Output (BrandProfileView)

## Data Model Changes

### New table: `brand_profiles`
```
id           String  @id @default(cuid())
userId       String  @map("user_id")
brandName    String  @map("brand_name") @db.VarChar(255)
contactEmail String? @map("contact_email") @db.VarChar(500)
contactPhone String? @map("contact_phone") @db.VarChar(50)
notes        String? @db.Text
createdAt    DateTime @default(now()) @map("created_at")
updatedAt    DateTime @updatedAt @map("updated_at")

@@unique([userId, brandName])
@@index([userId])
```

**Migration:** additive only. No changes to deals table. brandName string matching unchanged.
**Retention:** profile lives as long as user account (onDelete: Cascade via user relation).

## API Contract

```
GET  /api/v1/brands/:brandName
  → 200 { data: BrandProfileView } | 404 if no deals with that brandName for user
  BrandProfileView: { brandName, profile: BrandProfile|null, stats: BrandProfileStats, recentDeals: Deal[] }

PUT  /api/v1/brands/:brandName
  body: { contactEmail?, contactPhone?, notes? }
  → 200 { data: BrandProfile } (upsert — creates or updates)

DELETE /api/v1/brands/:brandName
  → 204 (deletes profile record; deals unchanged)
```

No versioning needed — new surface, additive.

## Events
Emits: none. Consumes: none. Stateless upsert pattern.

## Scale
- brandName lookup: O(1) via @@unique index on (userId, brandName)
- recentDeals: capped at 5, indexed by userId + brandName
- stats: single groupBy query; negligible at 10K creators, fine at 100K

## Tech Choices
| Choice | Alternatives | Why This |
|--------|-------------|----------|
| @@unique on userId+brandName | Brand.id FK on deals | Additive, no deal migration, matches existing loose-coupling pattern |
| PUT for upsert | POST+PATCH | Single endpoint, idempotent, mirrors REST convention for known identifier |
| Stats in GET response | Separate /stats endpoint | Fewer round-trips; profile page loads in one fetch |

## Operational Design
- Deploy: standard migration (additive table, no data migration, no downtime risk)
- Rollback: drop brand_profiles table (no deal data affected)
- Monitoring: no new alerts needed; profile CRUD is non-critical path
- RPO/RTO: profile is enrichment data — loss is recoverable, not revenue-critical
