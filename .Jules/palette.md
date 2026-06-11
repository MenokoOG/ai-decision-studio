## 2025-05-15 - [Accessible Table Inputs]
**Learning:** Dense data tables often lack proper context for screen readers when inputs are used within cells. Adding explicit `aria-label` attributes to each input (e.g., "Option name", "Cost score (0-10)") provides the necessary context that a standard table header might not sufficiently convey to assistive technologies.
**Action:** Always include descriptive `aria-label` attributes for inputs embedded in tables or grid layouts where visual labels are absent or distant.
