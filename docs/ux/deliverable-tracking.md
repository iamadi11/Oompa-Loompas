# UX: Deliverable Tracking

**Web shell & PWA:** [web-shell-pwa.md](./web-shell-pwa.md) · [pwa-web-client.md](../architecture/pwa-web-client.md)

## User Journey

1. Creator opens a deal detail page (already familiar — they added payments here)
2. Sees a new "Deliverables" section above the payments section
3. Zero state: sees a message "No deliverables added" with an "Add deliverable" button
4. Clicks "Add deliverable" — inline form appears (same pattern as Add payment)
5. Selects platform (Instagram), type (Reel), enters title ("3x Reels — campaign week 1"), optionally sets due date
6. Clicks "Add" — row appears immediately (router.refresh), form collapses
7. As campaign progresses, creator clicks "Mark complete" on each deliverable
8. Overdue deliverables (past due date, not complete) show red background — creator sees them instantly

## States

### Zero state (first use, no deliverables)
```
Deliverables                                    [+ Add deliverable]
                    ── No deliverables added. ──
                    Add the content you have committed to deliver  (link, aria-label: Add deliverable)
```
The header **+ Add deliverable** and the underlined line both open the same inline form.

### Loading state (after form submit)
- Button shows loading spinner (same as payment forms)
- `router.refresh()` triggers on success — section re-renders with new data

### Success state (deliverables present)
```
Deliverables                                    [+ Add deliverable]
┌──────────────────────────────────────────────────────────┐
│ INSTAGRAM  REEL   3x Reels — campaign wk 1   Due Apr 10  │ [Mark complete]
│ (no overdue state)                                        │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ YOUTUBE    VIDEO  Integration — main video    OVERDUE     │ [Mark complete]  ← red bg
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ INSTAGRAM  STORY  5x Stories                 COMPLETED   │           ← green indicator
└──────────────────────────────────────────────────────────┘
```

### Error state (API failure)
- Red alert banner above form (same pattern as payment forms), `role="alert"` and `aria-live="assertive"`
- Primary copy: "Failed to add deliverable. Try again." (or the API `message` when present)
- Form stays open (not discarded)

## Add Deliverable Form Fields
1. Title (text, required): placeholder "e.g. 3x Instagram Reels"
2. Platform (select, required): INSTAGRAM | YOUTUBE | TWITTER | LINKEDIN | PODCAST | BLOG | OTHER
3. Type (select, required): POST | REEL | STORY | VIDEO | INTEGRATION | MENTION | ARTICLE | OTHER
4. Due date (date input, optional)
5. Notes (text, optional): placeholder "Any internal notes"

## Layout Decision
Deliverables section appears **above** the payments section on the deal detail page.
Reason: Deliverables drive payments. The logical flow is "what I owe" (deliverables) →
"what I get paid" (payments). Creator sees obligations before compensation.

## Critic Feedback

**Brutal assessment:**

"Finally I can see what I owe the brand in the same place as what they owe me.
The platform + type dropdowns are right — I think 'Instagram Reel' not 'content piece'.
Title is flexible enough for anything weird.

The 'Mark complete' button placement is obvious — right on the row.
One click, no confirmation dialog — correct, this isn't irreversible.

What I'd complain about:
- I can't reorder deliverables. If I add them out of order, I'm stuck.
  (Acceptable for Phase 1 — they're ordered by creation time, predictable)
- No bulk 'add multiple' flow. If I have 10 deliverables I add them one by one.
  (Acceptable for Phase 1 — the form is fast)
- If I mark something complete by mistake, I tap **Undo** on the row — PATCH
  reverts to PENDING (same as API contract).

What I'd tell another creator:
'It's the first place I've seen that connects what I promised to deliver
with what I'm getting paid — and it lives in the same screen.'"

**Hardest UX problem:** Overdue deliverable visibility. A creator who has 8 deliverables
across 5 deals needs to see the overdue ones at a glance. Phase 1: overdue indicator
on the deal detail page. Phase 2: surface overdue deliverables on the dashboard.

## Accessibility
- Keyboard navigation: yes — all buttons and inputs are keyboard-accessible
- WCAG 2.2 AA: compliant — uses semantic HTML (section, fieldset-equivalent labels,
  aria-labelledby on section headings)
- Focus indicators: present — inherited from existing ui/Button and ui/Input components
- Mark complete buttons: aria-label includes deliverable title for screen reader context
- Platform/type selects: use native `<select>` with explicit `<label>` — accessible by default
