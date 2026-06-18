## 2025-05-14 - [Visual Affordance for Destructive Actions]
**Learning:** In a dense data-driven interface like the Decision Matrix, using standard 'ghost' or 'outline' variants for 'Remove' actions leads to poor visual affordance. Destructive actions should use a semantic 'destructive' color (red) to provide an immediate warning and clear distinction from primary/secondary actions.

**Action:** Always include a `destructive` variant in the core `Button` component and use it for data removal or irreversible actions, paired with descriptive icons (e.g., `Trash2`) and robust `aria-label` attributes.

## 2025-05-14 - [A11y in Dynamic Tables]
**Learning:** Interactive inputs within tables often lack explicit labels because their purpose is inferred from column headers. This is insufficient for screen readers.

**Action:** Ensure every table input has a descriptive `aria-label` (e.g., "Cost score" instead of just "Value") to provide context during keyboard navigation.

## 2025-05-14 - [Testing Electron Renderer in Browser]
**Learning:** Verifying an Electron renderer in a standard browser (like Playwright) requires comprehensive mocking of the `window` IPC bridge to avoid "Desktop bridge unavailable" errors and to populate the UI with test data.

**Action:** Create reusable mock handlers for `getTemplates`, `getInitiativeList`, and `getInitiativeById` when running frontend-only verification scripts.
