# UX: Deal Templates

## User Journey

### Create a template from scratch
1. `/deals` → "Templates" nav link (secondary, below "Brands")
2. `/deals/templates` → empty state or list → "New template" button
3. `/deals/templates/new` → form: name, default value, currency, notes, + deliverables list, + payments list
4. Save → redirect to `/deals/templates` with success flash

### Create a template from an existing deal
1. `/deals/:id` → action menu → "Save as template"
2. Prompt: name (pre-filled from deal title)
3. Confirm → create → toast "Template saved"

### Use a template to start a new deal
1. `/deals` → "New deal" dropdown → "From template..."
2. Template picker page: shows template cards (name, deliverable count, payment summary)
3. Select template → `/deals/new?templateId=xxx`
4. Form: title (required), brand name (required), start date, end date — value/currency/notes pre-filled from template
5. Below form: "Will create" preview — deliverables chips + payment milestone list with computed amounts
6. Submit → creates deal + deliverables + payments → redirect to deal detail

---

## Screen States

### `/deals/templates` — Template list
- **Zero state:** "No templates yet" — description: "Save your recurring deal structures — deliverables, payment split — and reuse them in seconds." + "New template" CTA
- **Loading:** skeleton cards
- **Populated:** grid of template cards (name, N deliverables, payment split preview e.g. "50% · 50%")
- **Error:** "Couldn't load templates" + retry

### Template card
- Name (bold)
- Deliverable count: "3 deliverables"
- Payment summary: percentage pills "50% · 50%"
- Default value if set: "₹50,000 default"
- Actions: "Use" (primary), "Edit" (ghost), "Delete" (danger, confirm dialog)

### `/deals/templates/new` + `/deals/templates/[id]/edit`
- Name field (required)
- Default value + currency (optional)
- Notes textarea (optional)
- Deliverables section:
  - "Add deliverable" button → inline row: title, platform, type
  - Drag reorder (or up/down buttons — reduced-motion safe)
  - Remove row button
  - Max 10 rows (add button disabled at limit)
- Payments section:
  - "Add payment" button → inline row: label, percentage
  - Percentage total indicator (green if = 100%, amber if ≠ 100%)
  - Remove row button
  - Max 10 rows
- Footer: Cancel | Save

### `/deals/new?templateId=xxx` — Apply template
- Same heading as regular new deal: "New deal"
- Sub-heading: "From template: {templateName}" (with "Clear template" ghost link)
- Required fields: title, brand name, start/end date
- Pre-filled (from template, editable): value, currency, notes
- Preview section ("What will be created"):
  - Deliverables list (chips with platform/type)
  - Payment milestones (label, computed amount based on deal value)
  - Live-updates as user types deal value
- Submit: "Create deal"

---

## Critic Review

**"Busy creator, first use — understand immediately?"**

- Template list: Yes. Empty state copy is clear. "New template" is obvious.
- "Save as template" on deal: One action, one prompt. Fast.
- "From template" on deal creation: Template picker reduces cognitive load vs blank form.

**Where user might get confused:**
- Percentage total ≠ 100%: Show amber indicator, don't block (intentional partial payment structures exist)
- "Will create" amounts: must update live as deal value changes — no stale previews
- Relative due dates: not in Phase 1 (templates have no dates). Clear in UI: "Dates are set when you create the deal."

**Churn risk:** Low — templates are a set-and-forget feature. Once created, value is in usage.

---

## A11y

- All form rows keyboard-navigable: Tab to add, Enter to confirm, Delete button has `aria-label="Remove deliverable"`
- Percentage input: `aria-describedby` → total indicator
- Template picker: list of radio-like cards, keyboard selectable
- Confirm-to-delete: native `confirm()` or focus-trapped dialog (dialog preferred)
- WCAG 2.2 AA: all interactive elements visible focus ring
