# UX: Payment invoice HTML (v1)

## User Journey

1. Open a **deal** with at least one payment milestone.  
2. In **Payments**, choose **View invoice** on the row.  
3. New tab opens with a **printable** HTML invoice (browser print / save as PDF).  
4. Share or attach using existing channels (email, drive, etc.).

## States

- **Zero state:** No payments — section copy unchanged; invoice link only appears on rows.  
- **Loading:** N/A (full navigation to API).  
- **Success:** HTML document with **invoice no. `INV-*`**, issue date (UTC), optional **issuer** block (from **`INVOICE_*`** env), **Bill to** brand, line item / totals / payment status tables, optional notes, **toolbar** (print, copy link, share, download HTML).  
- **Error:** API down or wrong URL — user sees browser error page; configure `NEXT_PUBLIC_API_URL` in production to match the deployed API.

## Critic Feedback

- **Friction:** Requires API reachable from the user’s browser; misconfigured env breaks the link (documented in error state).  
- **Trust:** Footer states the document is informational; legal/tax wording remains the creator’s responsibility until compliance requirements are scoped.  
- **Numbers:** Sequential **`INV-*`** is assigned the **first time** the invoice URL is opened and then **stuck** to that payment row; creators who need a different numbering scheme will still use external tools until configurable prefixes exist.

## Accessibility

- **View invoice** link has an **`aria-label`** including the formatted amount.  
- **Keyboard:** Link is focusable and opens in a new tab (`rel="noopener noreferrer"`).  
- **Focus visible:** Link uses **`focus-visible` ring** (brand) consistent with other revenue UI.  
- **Invoice document:** **`main`** landmark, table **`aria-label`**, status as **human-readable** labels (not raw enum strings).  
- **WCAG 2.2 AA:** Invoice page is simple semantic HTML; print stylesheet is minimal system fonts.

**Browser MCP checklist:** [docs/testing/browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md](../testing/browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md)
