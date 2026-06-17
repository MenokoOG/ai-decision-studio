# Palette's UX Journal

## 2025-05-15 - [Reusable Pattern] Destructive Button Variant
**Learning:** The project's base `Button` component was missing a `destructive` variant despite the color tokens (`destructive`, `destructive-foreground`) being defined in Tailwind. Adding this variant allows for consistent styling of irreversible actions (like "Remove" or "Delete").
**Action:** Always check `apps/desktop/src/renderer/components/ui/button.tsx` for semantic variants before implementing "Remove" actions. Use the `destructive` variant combined with a `Trash2` icon and `aria-label` for optimal UX and accessibility.
