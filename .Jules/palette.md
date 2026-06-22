## 2025-05-15 - [Destructive Action Styling]
**Learning:** Destructive actions like 'Remove' or 'Delete' should be visually distinct from secondary actions to prevent accidental data loss. Using a semantic `destructive` variant (red) combined with a recognizable icon (`Trash2`) provides a strong visual cue.
**Action:** Always check if a 'Delete' or 'Remove' button is using a neutral variant (ghost/outline) and upgrade it to `destructive` with an icon and `aria-label`.

## 2025-05-15 - [Testing Electron Renderers in Browser]
**Learning:** The Electron renderer can be verified in a standard browser by mocking the IPC bridge (`window.aiDecisionStudio`). This allows for automated screenshot capture and layout verification without the complexity of launching the full Electron environment.
**Action:** Use a Playwright `init_script` to provide mock implementations of all expected desktop bridge methods when verifying frontend changes.
