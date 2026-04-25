# Retro: Payment Follow-up Emails (v0.5.6)

## What was built
Automated threshold emails at 3d/7d/14d overdue per payment. One email per user per run, grouped across all threshold crossings. Dedup table prevents re-fire. Opt-out toggle in Settings. 295 API + 122 web tests green.

## Key decisions and why

**Cron over BullMQ**: No new infrastructure. Matches existing push + digest pattern. Solo-creator scale — 07:30 UTC daily batch is sufficient.

**Dedup record before send**: Correctness over completeness. If `createMany` fails, DB error is logged and no email sent. If email send fails after dedup record written, no duplicate on retry. Prefer a missed email over a duplicate payment-demand email.

**Opt-out model (default true)**: Matches `emailDigestEnabled` precedent. Follow-up emails are transactional (payment overdue = revenue impact) — appropriate to default on and let user disable.

**Per-user error isolation in Promise.all**: One bad user (corrupt data, missing relation) doesn't block others. Logged individually.

**`escapeHtml` from shared utils**: Simplify review caught a duplicate. Used `./html.js` which includes `&quot;` and `&#39;` escaping; our inline version was incomplete.

## Simplify findings fixed
- Removed duplicate `escapeHtml` in `payment-followup-email.ts` → use `./html.js`
- Moved `createMany` before `sendEmail` (correctness bug: dedup after send = possible duplicate on retry)
- GET `/notifications` parallelized with `Promise.all` (was sequential DB calls)

## Post-deploy baseline
- `payment_followup_emails` table rows: 0 (pre-launch)
- Watch: first cron run at 07:30 UTC post-deploy for log output `[FOLLOWUP] Done — sent to N user(s)`
- Watch: opt-out rate (target <20% in 30 days)

## What to watch
- Payments marked RECEIVED within 7d of follow-up email (conversion signal)
- Distribution of `day_threshold` values — healthy = mostly 3d; backlog = mostly 14d
- Any duplicate email reports from users (would indicate dedup table issue)

## What to do differently
- The `ONE_DAY_MS` constant is now defined in 3 separate job files. Should extract to `apps/api/src/lib/constants.ts` next time a job file is touched.
- `webUrl` construction pattern duplicated in 2 jobs — same fix opportunity.
