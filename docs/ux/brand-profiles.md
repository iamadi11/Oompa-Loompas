# UX: Brand Profiles

## User Journey
1. Creator opens /deals/brands (brand directory)
2. Sees brand rows — clicks "View profile" link on a row
3. Lands on /deals/brands/[brandName] — sees stats + contact info + notes + recent deals
4. If no contact info yet: inline form prompt "Add contact info"
5. Fills email/phone/notes → saves inline → immediate feedback
6. Clicks overdue deal from recent deals list → goes to /deals/[id]

## States
- **Zero state (no profile yet):** Stats still show from deals. Contact section shows "No contact info saved yet" + edit button.
- **Loading state:** Server component (no loading spinner needed — SSR). Skeleton or instant paint.
- **Success state:** Contact info displayed, editable inline. Stats show totals + overdue count.
- **Error state (API down):** "Could not load brand profile. Check API is running." with Back link.
- **404 state:** Brand not found in any deal for this user → "No deals found for [brandName]" + link to /deals/brands.

## Critic Feedback
- Creator doesn't want to fill a CRM form — make contact info editable in one click inline
- Stats must be immediately visible above the fold — don't bury them
- The "View deals" link from directory still works — profile is additive, not replacing the filter flow
- Phone number: don't validate format — creators have international brands with non-standard formats
- Don't call it "CRM" anywhere — feels heavy. Just "contact info" and "notes."

## Accessibility
- Keyboard navigation: yes — form fields, save button, back link all keyboard-accessible
- WCAG 2.2 AA: compliant — visible focus, semantic HTML, labeled inputs
- Focus indicators: present on all interactive elements
