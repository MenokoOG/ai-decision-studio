# UX

## Principles
- Premium but calm
- Dense information made readable
- Touch-friendly controls
- Narrow-width first
- Section-first editing: one section form at a time
- Explicit user closure: sections close only via a clear close action

## Visual Priorities
- Strong spacing
- Clear numbers
- High-contrast tables
- Sticky summary areas on small screens

## Interaction Pattern (Next Slice)
- Main workspace acts as a launcher/dashboard, not a full long-scroll editor.
- Selecting a section opens a focused section form surface (dialog, drawer, or dedicated sub-page route).
- Section forms must include these controls in a consistent location:
	- `Save`: persist section data
	- `Calculate`: recompute and push updates to shared overall report
	- `Clear`: reset section form inputs (with confirmation)
	- `Close`: return to launcher/dashboard
- Keep mobile ergonomics first: action controls should remain reachable near bottom for thumb access.
