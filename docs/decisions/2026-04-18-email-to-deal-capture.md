# Decision: Email/Text-to-Deal Capture

Date: 2026-04-18  
Phase: Phase 1 — Deal + Payment Intelligence (final remaining item)  
Status: APPROVED

## What

A "Parse from text" collapsible on `/deals/new`. Creator pastes a brand email or deal brief. A pure heuristic parser extracts:
- Brand name (capitalized entity, "from X", "Hi, this is X from Y" patterns)
- Deal value + currency (₹/$/€/£ symbols, INR/USD, lakh/K shorthands)
- Due date (natural-language dates, ISO, "next month")
- Deliverable keywords (reel, post, video, integration, story, short + counts)

Pre-fills the deal form. Creator reviews and saves. Never auto-creates.

## Why Now

SOT §2.4 lists email-to-deal capture as the only remaining Phase 1 item. Every other Phase 1 item is shipped. Manual deal entry (~5 min/deal) is the highest creation friction. Paste-capture reduces this to ~30 seconds.

No new infrastructure required — pure function parser in `@oompa/utils`, new API endpoint, form enhancement.

## Why Not Alternatives

| Alternative | Reason Rejected |
|-------------|----------------|
| SMTP email ingestion | Requires email server, DNS, deliverability — Phase 4 scope |
| LLM-based extraction | Adds cost/latency/nondeterminism; heuristics cover 80%+ cases with auditability (SOT §24.2) |
| Keep status quo | Highest friction point; blocks Phase 1 completion |

## User Without This

Creator receives brand email. Reads it. Opens app. Manually types: brand name, deal value, currency, due date, notes. 5+ minutes per deal. Misses details. Abandons tracking.

## Success Criteria

- Parser correctly extracts deal value from ≥80% of realistic brand email samples
- Form pre-fills in <500ms after paste
- Creator can override any pre-filled field before saving
- Zero auto-saves — always creator-confirmed

## Assumptions

- Brand deal emails contain structured patterns (amounts with symbols, deliverable keywords) — true for professional brand emails
- Creators will use the paste interface — reasonable (lower effort than typing)
- Extraction accuracy >50% is enough to save time even with review — yes (any pre-fill beats manual entry)
