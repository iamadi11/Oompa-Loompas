/** Read a single named control from a form; ignores non-input elements with the same name. */
export function readNamedInput(form: HTMLFormElement, name: string): HTMLInputElement | null {
  const el = form.elements.namedItem(name)
  return el instanceof HTMLInputElement ? el : null
}
