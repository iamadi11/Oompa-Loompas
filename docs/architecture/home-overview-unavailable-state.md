# Architecture: Home overview unavailable state

## Module
**Intelligence** (read path only): consumes `GET /api/v1/dashboard` via server-side `fetch` on the Next.js home route. No API or database changes.

## Data flow
Input: `fetch(API_URL + '/api/v1/dashboard')`  
→ Validate: HTTP ok + JSON shape (best-effort; failures yield `null`)  
→ Normalize: `resolveHomeOverviewState(data)` → `unavailable` | `empty` | `ready`  
→ Process: branch render  
→ Output: HTML for `/`

## Data model changes
None.

## API contract
Unchanged. Client behavior only.

## Events
Emits: none.  
Consumes: none.

## Scale analysis
One extra function call and a small client island for retry. No additional network traffic on success path.

## Tech choices
| Choice | Alternatives | Why this |
|--------|----------------|----------|
| Pure `resolveHomeOverviewState` in `lib/` | Inline `if` in page | Testable, documented, matches `deals-page` patterns |
| `'use client'` retry button | Meta refresh / “reload the page” copy | Matches existing `router.refresh()` usage; clearer affordance |

## Operational design
Deploy with standard web pipeline. Rollback: revert web commit; no migration.
