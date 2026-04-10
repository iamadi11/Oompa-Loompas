# Architecture: Attention queue CSV export

## Module: Intelligence (read path; shares deal/payment/deliverable domain rules)

## Data Flow
Input (session) → Auth → Load deals + relations → `collectPriorityActionsFromDeals` → Map to CSV rows (+ brand for deliverables) → CSV response

## Data Model Changes
None.

## API Contract
- **GET** `/api/v1/attention/export`
- **Auth:** session required; 401 if missing.
- **Response:** `text/csv; charset=utf-8`, `Content-Disposition: attachment`, UTF-8 BOM prefix.
- **Ordering:** identical to `GET /api/v1/attention` (oldest `dueDate` first, then payments before deliverables, then id tiebreak).
- **Cap:** first 5,000 actions after sort.

## Events
None.

## Scale Analysis
Same `findMany` + in-memory scan as GET /attention; acceptable for Phase 1. Heavy users hit cap documented in CHANGELOG.

## Tech Choices
| Choice | Alternatives | Why This |
|--------|--------------|----------|
| Reuse `collectPriorityActionsFromDeals` | Duplicate overdue rules | Single source of truth with dashboard/attention |
| `@oompa/utils` CSV builder | Inline string concat | Consistent escaping with portfolio exports |

## Operational Design
Standard deploy; rollback by removing route and button; no migration.
