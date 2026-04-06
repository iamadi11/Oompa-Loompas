# Instrumentation: Payment invoice HTML (v1)

## Hypothesis

If creators can open a **one-click invoice** from a payment row, fewer will abandon the “request payment / send paperwork” step when a brand asks for an invoice.

## Baseline

Pre-ship: no invoice URL; manual copy/paste only (not measurable in product).

## Post-deploy signals

| Signal | Where to read | Alert threshold |
|--------|----------------|-----------------|
| `5xx` rate on `GET .../invoice` | API logs / APM | Sustained spike vs other GET routes |
| Relative traffic to invoice path | Edge or API access logs | N/A (informational first week) |

## Rollout plan

Immediate — read-only route, no schema migration. Roll back by removing the route registration if critical defects appear.

## Learning milestone (30 days)

- Qualitative: support or user interviews — “Did you send this to a brand?”  
- Quantitative: if access logs exist, compare invoice GET volume vs count of deals with payments.
