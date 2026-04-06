# UX: GET /api/v1/health

## User journey
_Not applicable to creators._ This endpoint is for **operators**, **synthetic monitors**, and **load balancers**.

## States
- **Success:** `200` + JSON body; humans inspecting JSON in browser or `curl` see clear **`ok`** status.
- **Error:** If the process is wedged, TCP or HTTP layer fails before JSON — out of scope for this handler.

## Critic feedback
A creator never sees this URL. If we later surface “API status” in the web app, that UI must use **plain language** (“Connected” / “Can’t reach server”) — not raw JSON.

## Accessibility
No UI. Browser MCP validation uses navigation to the JSON document for **smoke** only.

## Related
- [docs/ux/home-overview-unavailable-state.md](./home-overview-unavailable-state.md) — creator-facing API failure experience
