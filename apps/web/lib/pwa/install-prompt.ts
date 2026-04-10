/**
 * Pure logic for the PWA install prompt dismiss state.
 * No browser APIs — fully testable in a Node environment.
 */

/** How long to suppress the prompt after the user dismisses it (30 days). */
export const INSTALL_PROMPT_DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1_000

export const INSTALL_PROMPT_STORAGE_KEY = 'oompa_install_prompt_dismissed'

/**
 * Returns `true` when the install prompt should be suppressed.
 *
 * @param storedValue - Raw string from `localStorage.getItem(INSTALL_PROMPT_STORAGE_KEY)`,
 *                      expected to be a ms-since-epoch integer string set at dismiss time,
 *                      or `null` if never dismissed.
 * @param now - Current timestamp in ms (injectable for testability).
 */
export function isInstallPromptSuppressed(storedValue: string | null, now: number): boolean {
  if (!storedValue) return false
  const dismissed = parseInt(storedValue, 10)
  if (Number.isNaN(dismissed)) return false
  return now - dismissed < INSTALL_PROMPT_DISMISS_TTL_MS
}
