# Test plan: Payment milestones CSV export

## Cases
| Scenario | Layer | Note |
|----------|--------|------|
| CSV builder quoting | `@oompa/utils` unit | Comma in deal title |
| GET 200 + BOM + query shape | API | `payment.findMany` tenancy |
| GET 401 | API | |
| Client blob + URL | Web `api.test` | `/export/payments` |
| Client JSON 403 | Web `api.test` | |

## Coverage
≥90% on new utils module and touched handlers/client paths.
