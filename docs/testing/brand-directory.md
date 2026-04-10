# Test Plan: Brand directory

## Cases
| Area | Coverage |
|------|----------|
| API `GET /deals/brands` merge + `_sum` | `deals.test.ts` |
| Zod `DealBrandSummary` | `deal.test.ts` |
| `dealsListSearchHref`, brand filter helpers | `deals-page.test.ts` |
| `listDealBrands` client | `api.test.ts` |
| `/deals/brands` highlights Deals nav | `main-nav.test.ts` |

## Regression
Deal form datalist still receives `contractedTotals` (ignored in UI).
