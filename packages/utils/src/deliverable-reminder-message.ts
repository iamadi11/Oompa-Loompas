import { formatDate } from './date.js'

export type BuildDeliverableReminderMessageInput = {
  dealTitle: string
  brandName: string
  deliverableTitle: string
  dueDateIso: string | null
}

/**
 * Builds a plain-text follow-up message for an overdue deliverable.
 */
export function buildDeliverableReminderMessage(
  input: BuildDeliverableReminderMessageInput,
): string {
  const brand = input.brandName.trim()
  const title = input.dealTitle.trim()
  const delTitle = input.deliverableTitle.trim()

  const greeting = brand.length > 0 ? `Hi ${brand},` : 'Hi,'
  const workLabel = title.length > 0 ? `"${title}"` : 'our engagement'
  const delLabel = delTitle.length > 0 ? `"${delTitle}"` : 'the deliverable'

  const duePart =
    input.dueDateIso !== null && input.dueDateIso.trim().length > 0
      ? ` which was scheduled for ${formatDate(input.dueDateIso)}.`
      : '.'

  return `${greeting}\n\nUpdating you on ${workLabel} — I'm still working on ${delLabel}${duePart}\n\nI will send it over as soon as possible. Thank you for your patience.`
}
