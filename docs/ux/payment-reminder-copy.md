# UX: Payment reminder copy

## User journey

1. Creator sees an overdue payment on **Overview** or **Attention**, or opens **Deal → Payments**.
2. Taps **Copy reminder**.
3. Pastes into email / WhatsApp / DM.

## States

- **Zero:** N/A (button only where a pending-style payment exists).
- **Success:** Toast “Reminder copied to clipboard”.
- **Error:** Toast “Could not copy” (permissions, unsupported browser).

## Accessibility

- **Copy reminder** uses `aria-label` and existing `Button` focus styles.
- **Priority list:** link remains keyboard-focusable; button is a separate tab stop.

## Critic feedback

Invoice links may require **login** when opened by the brand; the message should still read clearly if they cannot open the link. Future: public share token for invoice (out of scope here).
