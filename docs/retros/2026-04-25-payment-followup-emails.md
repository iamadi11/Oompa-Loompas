# Retro: Payment Follow-up Emails (v0.5.6)

## What was built
Automated threshold emails at 3d/7d/14d overdue per payment. One email per user per run, grouped across all threshold crossings. Dedup table prevents re-fire. Opt-out toggle in Settings. 295 API + 122 web tests green.

## Key decisions and why

**Cron over BullMQ**: No new infra. Matches existing push + digest pattern. Solo-creator scale — 07:30 UTC daily batch sufficient.

**Dedup record before send**: Correctness > completeness. `createMany` fail → DB error logged, no email. Email fail after dedup written → no duplicate on retry. Prefer missed email over duplicate payment-demand.

**Opt-out model (default true)**: Matches `emailDigestEnabled` precedent. Follow-up = transactional (overdue = revenue impact) → default on, user can disable.

**Per-user error isolation in Promise.all**: Bad user (corrupt data, missing relation) doesn't block others. Logged individually.

**`escapeHtml` from shared utils**: Simplify caught duplicate. Used `./html.js` (includes `&quot;` + `&#39;`); inline version was incomplete.

## Simplify findings fixed
- Removed duplicate `escapeHtml` in `payment-followup-email.ts` → use `./html.js`
- Moved `createMany` before `sendEmail` (correctness bug: dedup after send = possible duplicate on retry)
- GET `/notifications` parallelized with `Promise.all` (was sequential DB calls)

## Post-deploy baseline
- `payment_followup_emails` table rows: 0 (pre-launch)
- Watch: first cron run 07:30 UTC post-deploy for `[FOLLOWUP] Done — sent to N user(s)`
- Watch: opt-out rate (target <20% in 30 days)

## What to watch
- Payments marked RECEIVED within 7d of follow-up (conversion signal)
- `day_threshold` distribution — healthy = mostly 3d; backlog = mostly 14d
- Duplicate email reports (dedup table issue indicator)

## What to do differently
- `ONE_DAY_MS` now in 3 job files. Extract to `apps/api/src/lib/constants.ts` next job file touch.
- `webUrl` construction duplicated in 2 jobs — same fix opportunity.