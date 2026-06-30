## 2025-05-15 - [Destructive Action Affordance]
**Learning:** Generic 'ghost' or 'outline' buttons for destructive actions like 'Remove' lack visual weight and can lead to accidental data loss. Using a semantic 'destructive' variant (typically red) paired with a clear iconography (e.g., Trash icon) creates a stronger visual warning. Furthermore, icon-only or generic labels should be supplemented with context-specific `aria-label` attributes (e.g., "Remove option [Name]") to provide clear context for screen reader users.
**Action:** Always check for or implement a 'destructive' variant in the design system for any data-removal action. Ensure these actions include both visual (color/icon) and descriptive (aria-label) cues.

## 2025-05-15 - [Dynamic Error Message Visibility]
**Learning:** Error messages rendered conditionally based on state (e.g., `{error && <p>{error}</p>}`) are often not announced by screen readers when they appear. Adding `aria-live="polite"` ensures that these dynamic updates are communicated to users of assistive technology without interrupting their flow.
**Action:** Apply `aria-live="polite"` to status and error message elements that appear or update based on asynchronous logic.

## 2025-05-15 - [Icon Spacing and Component Noise]
**Learning:** Redundant utility classes like `gap-2` on a `Button` that already has it in its base styles add unnecessary noise. Furthermore, while `gap` is preferred, some designers prefer the visual breathing room of explicit margins (e.g., `mr-2`) on icons to ensure clear separation from text.
**Action:** Check base component styles before adding layout utilities and use consistent icon margins (`mr-2`) to standardize visual separation across the app.

## 2025-05-15 - [Disabled Action Tooltips]
**Learning:** Modern UI components often apply `pointer-events: none` to disabled buttons, which prevents native `title` tooltips from appearing. Wrapping the disabled button in a `span` or `div` with the `title` attribute ensures the tooltip remains accessible to mouse users without changing component styles.
**Action:** When adding explanatory tooltips to disabled buttons, wrap them in a container element to ensure hover events are captured.
