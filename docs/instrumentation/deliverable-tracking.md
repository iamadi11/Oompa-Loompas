# Instrumentation: Deliverable Tracking

## Hypothesis

If creators can list obligations per deal (platform, type, due date) and mark completion in the same place as payments, fewer deliverables slip through the cracks and payment delays tied to “content not shipped” become visible in one surface. Expected: within 14 days of ship, a majority of active deals with value above a nominal threshold have at least one deliverable row.

## Baseline

Before this feature: deal detail showed financial milestones only; work obligations lived outside the product (notes, DMs, Notion).

## Post-Deploy Signals

| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| Deliverable creation rate | `POST /api/v1/deals/:dealId/deliverables` request logs | Drop to 0 for >48h after launch (sanity) |
| Validation error rate | 400 responses on deliverables POST/PATCH | >15% of attempts sustained over 24h |
| Completion usage | `PATCH /api/v1/deliverables/:id` with `status=COMPLETED` | Confirms “done” path is discoverable |
| Overdue surfacing | UI/API: deliverables with past `dueDate`, not completed | Manual spot-check: any false “overdue” or missed overdue = bug |
| API error rate | 5xx on deliverable routes | >0.1% |

## Success Criteria (14-day post-deploy)

- Deliverable CRUD endpoints stay below 1% 5xx error rate.
- No sustained spike in 400s suggesting broken clients or schema drift.
- Qualitative: creators report they no longer need a second list for “what I still owe the brand.”

## Rollout Plan

Immediate full rollout. Additive API and UI on the deal detail page; existing deal and payment flows unchanged. Rollback: remove deliverable routes from `server.ts` and the deliverables section from the deal detail page; DB table can remain empty without affecting other modules.
