# Feature Candidates — PM Research Snapshot (April 2026)

**Authority:** [SOURCE_OF_TRUTH.md](../../SOURCE_OF_TRUTH.md) — outcome engine only; no vanity features.  
**Build filter:** Ships only if all 3 hold — (1) increases revenue or reduces risk, (2) automates or removes manual work, (3) simplest viable system.

---

## Phase 1 Status — COMPLETE

All Phase 1 ("Deal + Payment Intelligence") candidates are shipped:

| Feature | Shipped | Version |
|---------|---------|---------|
| Deal CRUD + payment tracking | 2026-04-04 | 0.1.x |
| HTML invoice per payment milestone | 2026-04-06 | 0.1.8 |
| Clipboard payment reminder | 2026-04-08 | 0.2.1 |
| Deal pipeline stage strip | 2026-04-09 | 0.2.2 |
| Shareable scope/proposal link | 2026-04-09 | 0.2.3 |
| Deal next-action prompt | 2026-04-09 | 0.2.4 |

---

## Honest Creator Personas

Three real archetypes. Not aspirational. Ship for **Karan** first; Rashi and Priya are already managing.

**Rashi — ₹2L/month, mid-tier Instagram + YouTube**  
Deals: 6–10 active. Pain: loses track of "who owes me what"; manually checks DMs for payment status. Win: any system that shows "₹32,000 overdue" without her building a spreadsheet.

**Karan — ₹60K/month, growing creator, solo**  
Deals: 2–3 active. Pain: underprices because he doesn't know his rate floor; sends scope in WhatsApp and forgets what he agreed to. Win: a proposal link he can paste into DMs and a reminder when payment is due.  
**This is the primary target.** At this stage, a missed payment or a bad deal materially damages him. He has no ops support.

**Priya — ₹4L/month, established, assistant helping**  
Deals: 10–20 active. Pain: assistant needs to track deliverables without getting full account access. Win: granular role access and workflow-level automation.  
**Phase 2 target.** Priya can tolerate manual work today.

---

## Phase 1.5 — PWA Engagement (Next 2–3 releases)

The shell is installed but passive. These make it active:

| Rank | Capability | User outcome | Complexity |
|------|------------|--------------|------------|
| 1 | **Push notification: payment overdue** | Creator acts before relationship sours | Medium — Vapid keys, SW push handler, opt-in flow |
| 2 | **Install prompt (A2HS)** | Creator returns daily without opening browser | Low — `beforeinstallprompt`, dismiss + defer logic |
| 3 | **Offline read-only deal view** | Creator checks deal status without signal | Low — SW cache strategy for `/deals/[id]` |
| 4 | **Push: deal next-action reminder** | Creator advances deal without checking daily | Medium — schedule-triggered push (after Phase 2 workers) |

**Ship order:** Install prompt → Offline deal view (same PR) → Push notifications (requires consent UI first).

---

## Phase 2 — Workflow Automation (Karan at scale, Priya today)

| Rank | Capability | User outcome | Complexity |
|------|------------|--------------|------------|
| 1 | **Scheduled email payment reminder** | Zero-touch AR collection | High — BullMQ job, email provider, unsubscribe link |
| 2 | **Email-to-deal capture** | Creator forwards a brand brief → deal draft auto-populated | High — inbound email parse, NLP extraction, review UI |
| 3 | **Recurring deal templates** | Creator duplicates a deal in 2 clicks | Low — template model, prefill flow |
| 4 | **Deliverable approval flow** | Brand confirms deliverable without DM back-and-forth | Medium — token-gated approval page |
| 5 | **Explainable rate floor** | Creator anchors negotiation to data, not gut | High — needs 20+ deal history; rules-first before ML |

**Most valuable, hardest to build:** Email-to-deal capture is the single highest-leverage automation for Karan — it converts a chaotic DM/email thread into a structured deal. Build after BullMQ infrastructure is in.

---

## Phase 3 — Pricing Intelligence (Priya + high-volume creators)

| Candidate | Dependency | User outcome |
|-----------|------------|--------------|
| Rate benchmarking (category + follower tier) | 50+ deals data | Creator knows if they're leaving money on the table |
| Campaign ROI estimate for brands | Deliverable + payment data | Creator can justify rate increase with data |
| Revenue forecast (pipeline × close probability) | Deal stage history | Creator can plan cashflow 90 days out |

Do not build Phase 3 features until Phase 2 automation is stable. Forecast with bad data is worse than no forecast.

---

## Explicit Non-Goals

- **Generic CRM** — contact graph, company records, pipeline theater. Violates "not a CRM" unless tightly tied to revenue timing.
- **Black-box AI pricing** — any output that can't be explained in one sentence to Karan. Trust > intelligence.
- **Collaboration features** — multi-user editing, comments, @mentions. Phase 3+ after role model is defined.
- **Mobile-native app** — PWA covers the install + offline case. Native requires separate release infra.

---

## Next Recommended Release

**0.2.5 — PWA Install Prompt + Offline Deal View**  
Ship together: `beforeinstallprompt` component + SW cache for `/deals/[id]` static shell.  
Outcome: creator can install from browser, return without friction, check active deals without signal.  
Complexity: low. Zero schema changes. Zero new API endpoints.
