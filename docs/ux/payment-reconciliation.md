# UX: Payment Reconciliation

## User Journey

**Entry:** `/reconcile` route accessible from Attention queue ("Reconcile payments" link) and Settings.

**Step 1 — Input (CSV or paste)**
- Two tabs: "Upload CSV" | "Paste / Enter manually"
- Upload: file input accepts `.csv`; browser parses client-side
- Manual: textarea where user pastes raw CSV or types `amount,date` pairs
- "Parse" button → shows N credits found

**Step 2 — Review matches**
- Table: bank transaction row + matched payment side-by-side
- Columns: ✓ checkbox | Bank amount | Received date (editable input, pre-filled from tx date) | Deal | Brand | Amount due | Confidence badge
- Unmatched transactions shown greyed out at bottom
- "Select all high/medium" shortcut button

**Step 3 — Apply**
- "Reconcile N payments" button (disabled until ≥1 selected)
- Optimistic: payments removed from overdue/attention queue immediately
- Success toast: "N payments marked received"
- Redirect to attention queue (which is now shorter)

## Zero / Loading / Error States

- **Zero pending payments:** "No pending payments to reconcile. All caught up!" + back to deals
- **Zero matches found:** "No matching payments found. Check that the amounts match your pending payments."
- **CSV parse error:** "Couldn't read this CSV. Try the manual entry tab."
- **Loading:** spinner on "Parse" and "Reconcile" buttons
- **Apply error:** toast "Failed to update some payments. Try again."

## Critic Feedback

**Busy creator, first use:** Will they understand "reconcile"? Risk: jargon. Fix: use "Mark as received from bank statement" as the page title. Sub-heading: "Upload your bank or UPI CSV to automatically match payments."

**Month 2:** Will they come back here regularly? Risk: feels like a chore. Fix: add a shortcut from the attention queue page ("Have payments? Reconcile from bank statement →") — no navigation required to find the feature.

**Mobile:** CSV upload is awkward on mobile. Fix: manual entry tab with a simple "Add amount" flow works on mobile.

## A11y

- File input: `<label>` associated, visible
- Table: `<thead>` with `scope="col"`, checkboxes with `aria-label`
- Confidence badges: not color-only (include text "High"/"Medium"/"Low")
- Received date inputs: `type="date"` with `aria-label`
- "Reconcile N payments" button: `aria-live` region updates count
