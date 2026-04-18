# UX: Deliverable Approval Flow

## User Journey

### Creator (Karan)
1. Opens deal detail → sees deliverable row
2. Clicks "Share approval link" → link copied to clipboard + toast "Approval link copied"
3. Pastes link in WhatsApp/DM to brand
4. Later: deal detail shows "Brand approved" green badge on that deliverable row
5. Can revoke: "Revoke" button removes the link (badge disappears)

### Brand
1. Opens `/a/:token` — no login required
2. Sees: "Review & Approve: [Title] for [Brand]" with deal/deliverable context
3. Clicks "Confirm Approval" — button changes to "Approved ✓"
4. Page shows confirmed state — can safely close

## States

### Deliverable row (deal detail page)
| State | UI |
|---|---|
| No approval token | "Share approval link" button |
| Token exists, not approved | "Copy link" + "Revoke" buttons |
| Token exists, approved | Green "Brand approved [date]" badge + "Revoke" |

### `/a/:token` page
| State | UI |
|---|---|
| Loading | Skeleton |
| Valid token, not yet approved | Deliverable details + "Confirm Approval" CTA |
| Already approved | "Already approved on [date]" confirmation state |
| Invalid/revoked token | "This link is no longer valid" error |

## Zero / Error States
- API unreachable → "Unable to load approval details" with retry
- Token not found → redirect-safe 404-style message (no sensitive info)
- Already approved → idempotent: shows confirmed state (not error)

## A11y
- `role="main"` on approval page content
- `aria-live="polite"` on status change after approve action
- Keyboard-operable: Confirm Approval button reachable via Tab
- Focus: after approve, button text updates in-place (no focus loss)
- WCAG 2.2 AA color contrast on all text

## Critic Feedback
**Karan's reaction:** "I can finally send a link and know they confirmed." Clear, no confusion. Zero new concepts — he knows how a share link works from the proposal feature.

**Brand's reaction on `/a/:token`:** "What am I approving?" — the page must show deliverable title, type, platform, and the deal brand name clearly at the top before the CTA. Not just a bare button.
