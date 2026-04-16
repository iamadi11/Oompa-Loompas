# UX: Brand Profiles Frontend

## Journey
1. Creator lands on /deals/brands (brand directory)
2. Clicks "Profile" link in brand row → /deals/brands/[brandName]
3. Sees: ← Brands breadcrumb, brand name header, Overview stats card, Contact card, Recent deals list
4. Clicks "Add contact info" (or "Edit") → inline form appears
5. Fills email/phone/notes → "Save" → form closes, values displayed

## States
| Screen | State | Behaviour |
|--------|-------|-----------|
| Profile page | No profile | "No contact info" empty state + "Add contact info" button |
| Profile page | Profile exists | dl/dt/dd read view with "Edit" button |
| Profile page | Unknown brand | "Brand not found" with ← All brands link |
| Edit form | Submitting | Save button shows spinner, disabled |
| Edit form | Server error | Inline error under fields |
| Edit form | Cancel | Editing closes, form discards changes |

## Critic Feedback (solo creator persona)
- First use: sees brand name + stats immediately without login friction ✓
- Contact info empty state is clear and inviting (not a wall of empty fields) ✓
- Char counter on notes field prevents silent truncation ✓
- "View all" link from recent deals goes to filtered deal list ✓

## A11y
- Section aria-labels: "Brand contact information", "Recent deals"
- dl/dt/dd for read view (semantic definition list)
- role="alert" on server error
- All interactive elements have focus-visible rings
- WCAG 2.2 AA: keyboard navigable, visible focus
