# Architecture: Deal Templates

**Module:** Deal  
**Phase:** Phase 1

---

## Data Flow

```
Creator picks "from template" → frontend fetches template → form pre-fills
                                                            → creator edits
                                                            → POST /deals → deal
                                                            → POST /deals/:id/deliverables (x N)
                                                            → POST /deals/:id/payments (x N)

Creator opens deal detail → "Save as template" → prompt name → POST /deals/:id/save-as-template
                                                              → DealTemplate + children created
```

---

## Schema Changes

Three new tables (additive, forward-compatible):

```prisma
model DealTemplate {
  id           String                    @id @default(uuid())
  userId       String                    @map("user_id")
  user         User                      @relation
  name         String                    @db.VarChar(255)
  defaultValue Decimal?                  @map("default_value") @db.Decimal(15, 2)
  currency     Currency                  @default(INR)
  notes        String?                   @db.Text
  deliverables DealTemplateDeliverable[]
  payments     DealTemplatePayment[]
  createdAt    DateTime                  @default(now())
  updatedAt    DateTime                  @updatedAt
  @@index([userId])
  @@map("deal_templates")
}

model DealTemplateDeliverable {
  id         String              @id @default(uuid())
  templateId String              @map("template_id")
  template   DealTemplate        @relation
  title      String              @db.VarChar(255)
  platform   DeliverablePlatform
  type       DeliverableType
  notes      String?             @db.Text
  sortOrder  Int                 @default(0) @map("sort_order")
  @@index([templateId])
  @@map("deal_template_deliverables")
}

model DealTemplatePayment {
  id         String       @id @default(uuid())
  templateId String       @map("template_id")
  template   DealTemplate @relation
  label      String       @db.VarChar(255)
  percentage Decimal      @db.Decimal(5, 2)   // 0.00 – 100.00
  notes      String?      @db.Text
  sortOrder  Int          @default(0) @map("sort_order")
  @@index([templateId])
  @@map("deal_template_payments")
}
```

**Migration:** additive only (new tables, no existing column changes). Rollback = `DROP TABLE deal_template_payments, deal_template_deliverables, deal_templates`.

**Retention policy:** deleted when `User` is deleted (CASCADE).

---

## API Contract

All routes under `/api/v1/templates`. Auth required. Scoped to `req.authUser.id`.

### GET /api/v1/templates
List user's templates with nested deliverables + payments (ordered by `sortOrder`).

**Response 200:**
```json
{ "data": [{ "id": "...", "name": "...", "defaultValue": 50000, "currency": "INR",
             "notes": null, "deliverables": [...], "payments": [...],
             "createdAt": "...", "updatedAt": "..." }] }
```

### POST /api/v1/templates
Create template. Max 20 per user (returns 409 if exceeded).

**Body:**
```json
{ "name": "YouTube Integration Standard",
  "defaultValue": 50000,
  "currency": "INR",
  "notes": null,
  "deliverables": [{ "title": "...", "platform": "YOUTUBE", "type": "INTEGRATION", "notes": null }],
  "payments": [{ "label": "Advance", "percentage": 50, "notes": null },
               { "label": "On delivery", "percentage": 50, "notes": null }] }
```

Validation:
- `name`: required, 1–255 chars
- `deliverables`: max 10 items
- `payments`: max 10 items; each `percentage` 0.01–100
- `defaultValue`: optional, positive if present
- `currency`: optional, defaults to INR

**Response 201:** full template object

### GET /api/v1/templates/:id
404 if not found or belongs to different user.

### PUT /api/v1/templates/:id
Full replace: deletes all existing deliverables + payments, inserts new ones atomically.
404 if not found/wrong user. Returns updated template.

### DELETE /api/v1/templates/:id
204 on success. 404 if not found/wrong user.

### POST /api/v1/deals/:id/save-as-template
Creates template from an existing deal's structure.

**Body:** `{ "name": "My Template Name" }`

Derives:
- `defaultValue` from `deal.value`
- `currency` from `deal.currency`
- `notes` from `deal.notes`
- deliverables: all deal deliverables → template deliverables (title, platform, type, notes)
- payments: `percentage = round(amount / dealValue * 100, 2)`; label from `notes` if present else "Payment {n}"

**Response 201:** new template object

---

## "Apply template" — frontend only

Template data is fetched client-side on the "New deal from template" page:
1. Fetch `GET /api/v1/templates/:id`
2. Pre-fill form: `defaultValue` → value field, `currency`, `notes`
3. Show "will create" preview: deliverables list + payments list with computed amounts
4. User fills: `title`, `brandName`, `startDate`/`endDate`
5. On submit: `POST /api/v1/deals` → then fire parallel `POST /deals/:id/deliverables` + `POST /deals/:id/payments`
6. Amounts computed: `Math.round(template.percentage / 100 * dealValue * 100) / 100`

No backend changes needed for apply.

---

## Scale

At 10K creators × 20 templates × 10 deliverables/payments each:
- `deal_templates`: 200K rows — `@@index([userId])` keeps queries O(1) per user
- `deal_template_deliverables`, `deal_template_payments`: 2M rows each — `@@index([templateId])` keeps nested fetches fast
- No caching needed at this scale

---

## Tech Choices

| Decision | Choice | Rationale |
|---|---|---|
| Nested replace | DELETE + createMany in `$transaction` | Simpler than upsert-by-id, avoids orphaned items |
| Percentage not amount | Store % | Templates reusable across deal values |
| sortOrder | Explicit Int column | Preserves user-defined order across edits |
| Max 20 templates | Hard cap at API | Prevents abuse; 20 covers any creator's campaign types |
| Apply = frontend only | No backend template-to-deal endpoint | Simpler; deal creation API unchanged |

---

## Ops

**Deploy:** standard Prisma migration. No downtime.  
**Rollback:** `DROP TABLE deal_template_payments, deal_template_deliverables, deal_templates;`  
**Monitoring:** `POST /api/v1/templates` rate + `POST /api/v1/deals/:id/save-as-template` rate.
