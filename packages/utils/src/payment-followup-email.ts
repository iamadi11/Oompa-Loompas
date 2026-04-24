import type { Currency } from '@oompa/types'
import { formatCurrency } from './currency.js'
import { escapeHtml } from './html.js'
import { buildPaymentReminderMessage } from './payment-reminder-message.js'

export interface FollowupEmailItem {
  paymentId: string
  dealId: string
  dealTitle: string
  brandName: string
  amount: number
  currency: Currency
  dueDateIso: string | null
  dayThreshold: 3 | 7 | 14
}

const THRESHOLD_LABEL: Record<3 | 7 | 14, string> = {
  3: '3 days overdue',
  7: '1 week overdue',
  14: '2 weeks overdue — escalate now',
}

function buildSubject(maxThreshold: 3 | 7 | 14, count: number): string {
  const multi = count > 1 ? `: ${count} payments need follow-up` : ''
  if (maxThreshold === 14) {
    return multi ? `Action needed${multi}` : 'Action needed: payment 2 weeks overdue'
  }
  if (maxThreshold === 7) {
    return multi ? `Urgent${multi}` : 'Urgent: payment is 1 week overdue'
  }
  return multi ? `Follow up${multi}` : 'Follow up: payment is 3 days overdue'
}

export function buildFollowupEmail(
  items: FollowupEmailItem[],
  webUrl: string,
): { subject: string; html: string; text: string } {
  const sorted = [...items].sort((a, b) => b.dayThreshold - a.dayThreshold)
  const maxThreshold = (sorted[0]?.dayThreshold ?? 3) as 3 | 7 | 14
  const attentionUrl = `${webUrl}/attention`
  const settingsUrl = `${webUrl}/settings`

  const subject = buildSubject(maxThreshold, items.length)

  const htmlRows = sorted
    .map((item) => {
      const label = THRESHOLD_LABEL[item.dayThreshold]
      const amt = formatCurrency(item.amount, item.currency)
      const dealUrl = `${webUrl}/deals/${item.dealId}`
      const reminderText = buildPaymentReminderMessage({
        dealTitle: item.dealTitle,
        brandName: item.brandName,
        amount: item.amount,
        currency: item.currency,
        dueDateIso: item.dueDateIso,
      })
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #f0ece6;">
            <div style="margin-bottom:4px;">
              <b style="color:#1c1917;">${escapeHtml(item.brandName)}</b>
              <span style="color:#dc2626;font-weight:600;"> — ${escapeHtml(amt)}</span>
              <span style="color:#78716c;font-size:13px;"> ${escapeHtml(label)}</span>
            </div>
            <div style="font-size:12px;color:#78716c;margin-bottom:8px;">${escapeHtml(item.dealTitle)}</div>
            <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;padding:12px;font-size:13px;color:#44403c;white-space:pre-wrap;font-family:monospace;">${escapeHtml(reminderText)}</div>
            <a href="${dealUrl}" style="display:inline-block;margin-top:8px;color:#d97706;font-size:13px;text-decoration:none;">→ View deal</a>
          </td>
        </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;border:1px solid #e7e5e4;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid #f0ece6;">
      <span style="font-size:20px;font-weight:700;color:#1c1917;">Oompa</span>
      <span style="font-size:14px;color:#78716c;margin-left:8px;">Payment follow-up</span>
    </div>
    <div style="padding:20px 28px;">
      <p style="margin:0 0 16px;font-size:14px;color:#44403c;">
        ${sorted.length === 1
          ? `<b>${escapeHtml(sorted[0]!.brandName)}</b> hasn't paid yet. Here's a message you can send:`
          : `${sorted.length} payments need your attention. Copy and send the messages below.`}
      </p>
      <table style="width:100%;border-collapse:collapse;">${htmlRows}</table>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f0ece6;">
        <a href="${attentionUrl}" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">View attention queue →</a>
      </div>
    </div>
    <div style="padding:16px 28px;background:#fafaf9;border-top:1px solid #f0ece6;">
      <p style="margin:0;font-size:12px;color:#a8a29e;">
        You're receiving this because a payment is overdue in Oompa.<br>
        <a href="${settingsUrl}" style="color:#78716c;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`

  const textParts: string[] = ['OOMPA — Payment Follow-up\n']
  for (const item of sorted) {
    const amt = formatCurrency(item.amount, item.currency)
    const label = THRESHOLD_LABEL[item.dayThreshold]
    textParts.push(`\n${item.brandName} — ${amt} (${label})`)
    textParts.push(`Deal: ${item.dealTitle}`)
    const reminderText = buildPaymentReminderMessage({
      dealTitle: item.dealTitle,
      brandName: item.brandName,
      amount: item.amount,
      currency: item.currency,
      dueDateIso: item.dueDateIso,
    })
    textParts.push(`\nMessage to send:\n${reminderText}`)
    textParts.push(`\nView deal: ${webUrl}/deals/${item.dealId}`)
  }
  textParts.push(`\nView all overdue: ${attentionUrl}`)
  textParts.push(`Manage preferences: ${settingsUrl}`)

  return { subject, html, text: textParts.join('\n') }
}
