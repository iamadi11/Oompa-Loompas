# Test plan: Deliverables portfolio CSV export

| Scenario | Layer |
|----------|--------|
| CSV escaping | `@oompa/utils` unit |
| GET 200 + query + BOM | API |
| GET 401 | API |
| Empty list → header only | API |
| dueDate/completedAt/notes populated | API branch coverage |
| Client URL + blob + 403 | Web `api.test` |

Coverage ≥90% on touched modules; API global branch threshold preserved.
