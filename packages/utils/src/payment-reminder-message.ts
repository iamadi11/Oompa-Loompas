import type { Currency } from '@oompa/types'
import { formatCurrency } from './currency.js'
import { formatDate } from './date.js'

export type BuildPaymentReminderMessageInput = {
  dealTitle: string
  brandName: string
  amount: number
  currency: Currency
  dueDateIso: string | null
  /** Absolute invoice URL; line omitted when null, undefined, or whitespace */
  invoiceUrl?: string | null
}

/**
 * Builds a plain-text follow-up message a creator can paste into email or chat.
 * Deterministic for the same inputs (locale fixed via formatCurrency / formatDate).
 */
export function buildPaymentReminderMessage(input: BuildPaymentReminderMessageInput): string {
  const brand = input.brandName.trim()
  const title = input.dealTitle.trim()
  const greeting = brand.length > 0 ? `Hi ${brand},` : 'Hi,'
  const workLabel = title.length > 0 ? `"${title}"` : 'our engagement'
  const amountLabel = formatCurrency(input.amount, input.currency)

  const duePart =
    input.dueDateIso !== null && input.dueDateIso.trim().length > 0
      ? ` This was due on ${formatDate(input.dueDateIso)}.`
      : ''

  const invoiceRaw = input.invoiceUrl?.trim()
  const invoicePart =
    invoiceRaw !== undefined && invoiceRaw.length > 0 ? `\n\nInvoice:\n${invoiceRaw}` : ''

  return `${greeting}\n\nFollowing up on ${workLabel} — ${amountLabel} is still outstanding.${duePart}${invoicePart}\n\nThank you.`
}
