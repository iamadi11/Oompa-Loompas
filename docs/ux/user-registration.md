# UX: User Registration

## User Journey
1. Creator visits app for first time via Vercel URL
2. Lands on /login (unauthenticated redirect)
3. Sees "Don't have an account? Sign up" link → clicks → /register
4. Enters email, password, confirms password
5. Submits form
6. Client validates: passwords must match, password ≥ 8 chars
7. On success: session established, redirect to home (/)
8. On failure: error shown inline with role="alert", field marked aria-invalid

## States
- Zero state: empty form, "Register" button disabled until fields filled
- Loading state: form submit in-flight (button shows loading state)
- Success state: silent redirect to home — no toast needed (user is now in the app)
- Error state: inline error message below form, aria-invalid on field, role="alert" for screen readers

## Critic Feedback
The form is deliberately minimal — email, password, confirm password. No name field (creators don't want to fill out profiles before seeing value). The confirm password field exists to prevent typo lockouts since there is no email verification step. The keyboard flow (Tab → Tab → Enter) is tested. The "Already have an account? Sign in" link closes the loop without requiring back navigation.

## Accessibility
- Keyboard navigation: yes — Tab advances fields, Enter submits
- WCAG 2.2 AA: compliant — aria-invalid, role="alert", visible focus indicators
- Focus indicators: present (inherited from dark theme styles)
