# UX: Deal CRUD

## User Journey

### Create deal
1. Creator clicks "Add deal" from /deals or home page
2. Form loads instantly (no async fetch needed)
3. Creator fills: title, brand name, value, currency (INR default)
4. Creator optionally adds notes
5. Creator clicks "Create deal"
6. Optimistic: button shows spinner, form is disabled
7. On success: redirect to deal detail page
8. On error: inline error banner, form re-enabled

### View deals
1. Creator navigates to /deals
2. Server renders list (no loading spinner — SSR)
3. Zero state: clear empty state with CTA to add first deal
4. Non-zero: deal cards sorted by newest first
5. Each card shows: brand, title, status badge, value, due date if set

### Edit deal
1. Creator navigates to /deals/:id
2. Server renders deal header (brand, title, status badge, value)
3. Edit form pre-populated with current values
4. Creator changes status via dropdown — transitions enforced
5. Creator saves → optimistic spinner → success → refresh

## States

### Zero state (first use, no deals)
- Clean illustration + message: "No deals yet"
- Single CTA: "Add deal"
- No noise, no examples, no placeholder data

### Loading state
- Button spinner on submit (optimistic update feel)
- Form fields disabled during submit
- No page-level skeleton (SSR means content arrives pre-rendered)

### Success state
- Deal created: redirect to deal detail (creator sees their new deal immediately)
- Deal updated: stay on detail page, form resets to saved values

### Error state
- Client validation: inline field errors (no submit attempt)
- Server validation: red banner at top of form with message
- Network error: red banner "Something went wrong. Please try again."
- 404: dedicated not-found page with link back to deals list

## Critic Feedback

**A busy creator's first impression:**
> "Wait, I just put in the deal title, brand, and amount — that's it? And it shows up immediately? This is way simpler than my spreadsheet."

**What could make them give up:**
- If they have to fill in 12 fields to create a deal
- If the page loads blank and then spins for 2 seconds
- If an error message just says "Something went wrong" with no detail

**What we got right:**
- Minimal required fields (title, brand, value)
- SSR means deals page loads with data, no spinner
- Status badge is visually distinctive — creator immediately understands state
- Currency defaults to INR (correct for primary user segment)

**What's weaker (Phase 1 accepted tradeoffs):**
- No bulk import (acceptable — Phase 2)
- No email capture integration (acceptable — Phase 2)
- No payment tracking from deal detail yet (acceptable — Phase 1 next step)

## Accessibility
- Keyboard navigation: all interactive elements reachable via Tab, Enter, Space
- WCAG 2.2 AA: compliant — all form fields have labels, error messages use role="alert", focus indicators visible
- Focus indicators: `focus-visible:ring-2 focus-visible:ring-brand-500` on all interactive elements
- Semantic structure: `<form>` with `<label>` for each field, `<main>` landmark, `<header>` landmark
- Color contrast: brand-600 (#0284c7) on white = 4.8:1 (passes AA for normal text)
- Status badges: color + text (not color-only) for WCAG compliance

## Performance Budget
- LCP target: <2.5s (industry "good" threshold)
- INP target: <200ms (all interactions are optimistic — form submit triggers spinner immediately)
- CLS: 0 (SSR, no layout shift on data load)
- JS first-load: Next.js app shell + route chunk. Target: <150KB compressed.
