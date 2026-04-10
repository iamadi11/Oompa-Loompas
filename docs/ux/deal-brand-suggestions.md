# UX: Deal brand suggestions

## User Journey
1. Open **New deal** or **Edit deal**.
2. Focus **Brand name**; browser may show suggestions from past brands.
3. Pick a suggestion or type a new brand; submit as today.

## States
- Zero state: no prior deals → empty datalist; no hint line.
- Loading state: suggestions populate after mount without blocking typing.
- Success state: hint “Pick a brand you used before or type a new one.” when suggestions exist.
- Error state: API failure → silent; field behaves as plain text (network-truth not required for optional hints).

## Critic Feedback
Datalist UX varies by browser; power users may want searchable combobox later. Case-sensitive distinct strings remain a data hygiene issue until normalization or profiles.

## Accessibility
- Keyboard navigation: native list behavior + existing input focus ring.
- WCAG 2.2 AA: no regression; hint uses `Input` hint slot.
- Focus indicators: unchanged from base `Input`.
