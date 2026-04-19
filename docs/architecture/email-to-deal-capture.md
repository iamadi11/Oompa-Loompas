# Architecture: Email/Text-to-Deal Capture

## Module
Utils (shared) + Web (UI) — no API changes.

## Data Flow
```
Creator pastes text
  → parseDealFromText(text): ParsedDeal   [client-side, @oompa/utils]
  → form state pre-filled
  → creator reviews + edits
  → POST /api/v1/deals (existing endpoint, unchanged)
```

## New Files
- `packages/utils/src/deal-text-parser.ts` — pure function, zero side effects, no deps
- `packages/utils/src/__tests__/deal-text-parser.test.ts` — unit tests
- `packages/utils/src/index.ts` — add export

## Changed Files
- `apps/web/components/deals/DealForm.tsx` — add collapsible "Parse from email" section (create mode only)
- `apps/e2e/tests/deal-crud.spec.ts` — add E2E tests for parse flow

## API Contract
No changes to API. Parser output maps to existing `CreateDeal` fields:
```typescript
interface ParsedDeal {
  title?: string       // → form.title
  brandName?: string   // → form.brandName
  value?: number       // → form.value (numeric string)
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP'  // → form.currency
  notes?: string       // → form.notes (appended or set)
}
```

## Parser Algorithm

Priority order for value extraction:
1. Lakh shorthand: `₹2.5L`, `2 lakhs`, `2 lac`, `2 lacs` → × 100,000
2. K shorthand: `₹50K`, `50k` → × 1,000
3. Symbol + commas: `₹1,00,000`, `$5,000`
4. Text prefix: `Rs. 25000`, `INR 80000`, `USD 5000`

Currency map: ₹/Rs/INR → INR · $/USD → USD · €/EUR → EUR · £/GBP → GBP

Brand name heuristics (first match wins):
1. `Hi/Hello, (?:I'm |I am )?(.+) from ([A-Z][A-Za-z0-9 ]+)` → group 2
2. `from ([A-Z][A-Za-z0-9& ]+)(?:\.|,|\s)` near "team|marketing|brand|partnership"
3. Email domain: `@([a-z]+)\.` → capitalize first letter
4. Capitalized 1–3 word sequence near "collaboration|deal|sponsorship|campaign"

Title generation (if no subject line):
- `{brandName} {deliverableType}` e.g. "Nike YouTube Integration"
- Deliverable types: reel, post, video, integration, story, review, short → mapped to Title Case

Notes extraction:
- Deliverable count + type phrases: "3 reels", "1 YouTube video", "2 Instagram posts"
- Collapsed into comma-separated string for notes pre-fill

## Scale / Performance
Pure regex/string ops on < 10KB text. <1ms execution. No I/O. Safe in any environment.

## Rollback
UI-only addition. Removing `<ParseFromEmail>` component reverts with no data impact.
