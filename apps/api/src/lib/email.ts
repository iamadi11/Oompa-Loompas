import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env['RESEND_API_KEY']) return null
  if (!_resend) _resend = new Resend(process.env['RESEND_API_KEY'])
  return _resend
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const resend = getResend()
  if (!resend) return // RESEND_API_KEY not configured — silently no-op

  const from = buildFrom()
  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}

function buildFrom(): string {
  const name = process.env['RESEND_FROM_NAME'] ?? 'Oompa'
  const email = process.env['RESEND_FROM_EMAIL'] ?? 'noreply@oompa.app'
  return `${name} <${email}>`
}

/** Returns true if email sending is configured (for health/skip checks). */
export function isEmailConfigured(): boolean {
  return !!process.env['RESEND_API_KEY']
}
