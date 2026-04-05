# Test plan: Deals “needs attention” filter

| Scenario | Expected |
|----------|----------|
| `needsAttention=true` | `where.AND` contains `OR` of payments + deliverables overdue shapes |
| `needsAttention=yes` | 400 |
| `listDeals({ needsAttention: 'true' })` | Query string contains `needsAttention=true` |

Files: `apps/api/src/__tests__/deals.test.ts`, `apps/web/lib/__tests__/api.test.ts`.
