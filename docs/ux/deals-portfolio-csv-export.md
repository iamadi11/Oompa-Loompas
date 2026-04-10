# UX: Deals portfolio CSV export

## User journey
1. Creator opens **Deals** (pipeline or needs-attention).  
2. Clicks **Export CSV** (visible whenever the list loaded successfully).  
3. Browser saves `oompa-deals-portfolio-<date>.csv`.  
4. Opens in Excel/Sheets for CA or personal records.  

## States
- **Zero state:** Export still available — file contains header row only.  
- **Loading:** Button label “Exporting…”, disabled.  
- **Success:** Silent download (no toast in v1).  
- **Error:** Red inline message under the button; user can retry.  

## Critic feedback
- No preview of columns before download — acceptable for v1; filename and docs describe schema.  
- Empty portfolio export might confuse — mitigated by header-only file still being valid.  

## Accessibility
- **Keyboard:** Button is a native `<button>`, focus ring matches deals page patterns.  
- **WCAG 2.2 AA:** Error text exposed with `role="status"`; icon is decorative (`aria-hidden`).  
