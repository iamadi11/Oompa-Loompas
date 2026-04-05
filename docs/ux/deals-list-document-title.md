# UX: Deals list document titles

## User journey

1. Creator opens **Deals** from the shell or a deep link.
2. Browser tab / screen reader **document name** matches the mental model: **all deals** vs **needs attention** filter.

## States

- **All deals:** Title reads **`Deals · Revenue`** (via template).
- **Needs attention:** **`Needs attention · Revenue`** when the filter query is active.

## Critic feedback

Titles are **short and boring** — good. No extra marketing copy in the tab.

## Accessibility

- Document title updates with **route + query**; complements **`aria-current`** on deal filter links and main nav **Deals**.
