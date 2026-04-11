# Test Plan: PWA Push Notifications

## Coverage Baseline
Target ≥90% for module `@oompa/api` (routes `push.ts`, job `push-notifications.ts`) and `@oompa/web` (push hooks).

## Test Cases
| Module | Behavior | Path / Scenario | Expectation |
|---|---|---|---|
| API | Subscribe push | POST `/api/v1/push/subscribe` with valid keys | `204 No Content`, inserts row in `push_subscriptions` |
| API | Subscribe push (dup) | POST `/api/v1/push/subscribe` existing user/endpoint | Upserts/Updates silently, `204` |
| API | Unsubscribe | DELETE `/api/v1/push/unsubscribe` | Removes row, `204 No Content` |
| API | Job Trigger | `push-notifications.ts` daily cron | Selects users with subscriptions + matched overdue items |
| API | Max pushes | User has 5 overdue things | Max 3 notifications sent per run |
| API | Privacy | Push payload generation | Payload DOES NOT contain monetary amounts |

## Failure Modes
- Database down: Handled by Fastify global error handler.
- VAPID keys missing: API startup should throw instead of failing silently.
- Browser rejects push (permissions revoked): `web-push.sendNotification()` throws 410 Gone, we should delete the subscription from DB.

## Acceptance Criteria
- User can opt-in from `/settings/notifications`
- Notification click routes correctly to deals page
- Pushes received when conditions are met
