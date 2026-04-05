# Architecture: Deal CRUD

**Web shell & PWA:** [web-shell-pwa.md](../ux/web-shell-pwa.md) · [pwa-web-client.md](./pwa-web-client.md)

## Module: Deal
Phase 1 — Deal + Payment Intelligence

## Data Flow
Input (HTTP) → Validate (Zod schema) → Normalize (type cast, Decimal conversion) → Process (Prisma query) → Output (JSON response)

No step is skipped. Validation happens before any DB call.

## Data Model Changes

### New table: `deals`
| Column      | Type           | Constraints                         |
|-------------|----------------|-------------------------------------|
| id          | UUID           | PK, default: uuid()                 |
| title       | VARCHAR(255)   | NOT NULL                            |
| brand_name  | VARCHAR(255)   | NOT NULL, indexed                   |
| value       | DECIMAL(15,2)  | NOT NULL, positive                  |
| currency    | enum Currency  | NOT NULL, default: INR              |
| status      | enum DealStatus| NOT NULL, default: DRAFT, indexed   |
| start_date  | TIMESTAMPTZ    | nullable                            |
| end_date    | TIMESTAMPTZ    | nullable                            |
| notes       | TEXT           | nullable                            |
| created_at  | TIMESTAMPTZ    | NOT NULL, default: now(), indexed desc |
| updated_at  | TIMESTAMPTZ    | NOT NULL, auto-updated              |

### New table: `payments`
| Column      | Type              | Constraints                  |
|-------------|-------------------|------------------------------|
| id          | UUID              | PK, default: uuid()          |
| deal_id     | UUID              | FK → deals(id) CASCADE DELETE |
| amount      | DECIMAL(15,2)     | NOT NULL, positive           |
| currency    | enum Currency     | NOT NULL, default: INR       |
| status      | enum PaymentStatus| NOT NULL, default: PENDING   |
| due_date    | TIMESTAMPTZ       | nullable, indexed            |
| received_at | TIMESTAMPTZ       | nullable                     |
| notes       | TEXT              | nullable                     |
| created_at  | TIMESTAMPTZ       | NOT NULL, default: now()     |
| updated_at  | TIMESTAMPTZ       | NOT NULL, auto-updated       |

### Migration plan
Forward-compatible: new tables only. No existing schema affected. Rollback: `DROP TABLE payments; DROP TABLE deals;` (safe in pre-prod, requires data backup in prod).

### Retention policy
Deals: indefinite (creator's business records, required for invoicing).
Payments: indefinite (financial audit trail).
Deletion: cascades to payments when a deal is deleted. User-initiated only.

## API Contract

### Endpoints
| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| GET    | /api/v1/deals     | List deals (paginated)   |
| GET    | /api/v1/deals/:id | Get single deal          |
| POST   | /api/v1/deals     | Create deal              |
| PATCH  | /api/v1/deals/:id | Update deal (partial)    |
| DELETE | /api/v1/deals/:id | Delete deal              |

### Status transitions (enforced server-side)
```
DRAFT → NEGOTIATING | CANCELLED
NEGOTIATING → ACTIVE | CANCELLED
ACTIVE → DELIVERED | CANCELLED
DELIVERED → PAID | ACTIVE (reactivate if revision needed)
PAID → (terminal)
CANCELLED → (terminal)
```
Invalid transitions return HTTP 409.

### Versioning
Current: v1. Breaking changes require `/api/v2/...` prefix and deprecation notice.

## Events
Phase 1: no external event emission (internal only).
Phase 2 will emit: `deal.created`, `deal.status_changed`, `payment.overdue` via internal event bus.

## Scale Analysis
- 100 creators × 50 deals avg = 5,000 rows. Trivially fast.
- 10,000 creators × 200 deals avg = 2M rows. Indexed queries stay <10ms.
- 100,000 creators = 20M rows. Add read replicas, pagination is already enforced (max 100/page).
- Bottleneck at scale: Prisma connection pool. Mitigation: PgBouncer in front of PostgreSQL.
- Caching strategy: Phase 1 — no cache (data freshness required). Phase 2 — Redis for deal summaries.
- Async/sync boundary: all Phase 1 operations are synchronous request/response.

## Tech Choices
| Choice | Alternatives | Why This |
|--------|-------------|----------|
| Fastify 4 | Express, Hapi | Fastest Node.js HTTP framework, TypeScript-native, low overhead |
| Prisma 5 | Drizzle, Knex, TypeORM | Best DX in monorepo, type-safe queries, migration system |
| Zod 3 | Joi, Yup, class-validator | Works at runtime AND compile time, used in both API and Web |
| PostgreSQL | MySQL, SQLite | DECIMAL for money (no float precision bugs), best JSON support |
| pnpm workspaces | npm workspaces, Turborepo | Symlink-based, fast installs, no hoisting bugs |

## Operational Design

### Deploy
Standard CI pipeline → build → migrate (prisma migrate deploy) → restart API.
No ad-hoc agent production changes.

### Monitoring
- Metric: `api.deals.request_duration_ms` (histogram, labeled by method + status code)
- Alert: p99 > 500ms for any deals endpoint
- Alert: 5xx rate > 1% over 5 minutes
- Health: `GET /health` → used by load balancer health checks

### Rollback procedure
1. Detect via alert or health check failure
2. Roll back deployment (previous container image)
3. Schema rollback only if forward-compat is broken: `DROP TABLE deals, payments` (dev/staging only; prod requires data migration)
4. Estimated RTO: <5 minutes (container rollback)

### RPO/RTO
- RPO: 1 hour (automated backup cadence)
- RTO: <5 minutes for app, <30 minutes for full DB restore
