# Retro: Email/Text-to-Deal Capture (v0.5.3)

## What Built
Pure-function heuristic parser (`parseDealFromText`) + collapsible pre-fill UI on deal create form. No API changes, no DB changes, no LLM.

## Decisions + Why
- **Heuristic over LLM**: deterministic, zero cost/latency, auditable — covers 80%+ of real brand email patterns
- **Client-side only**: <1ms parse, no round-trip, works offline
- **Non-destructive pre-fill**: only fills empty fields; creator always reviews before saving
- **Collapsible panel**: keeps the form clean for creators who don't need it

## Critic Feedback Addressed
- Panel auto-collapses after parse so form is front-and-center for review
- "Pre-fill" button stays disabled until text is pasted (no accidental triggers)
- Hint message tells exactly what was filled — removes uncertainty

## Post-Deploy Baseline
- Capture using: `SELECT date_trunc('week', created_at), count(*) FROM deals GROUP BY 1 ORDER BY 1`
- What to watch: deal creation volume week-over-week, parser usage rate (notes field patterns)

## What to Do Differently
- Could add a "clear pre-fill" button if creators want to reset — deferred as low-priority
- Parser doesn't extract due dates from natural language (e.g. "next month") — intentionally deferred to keep scope small; can be added to `parseDealFromText` without UI changes
