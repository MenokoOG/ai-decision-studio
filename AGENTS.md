# AGENTS.md

## Canonical agent contract
This is the single canonical agent instruction file for the repository.

Read this file first.
Only read a nested `AGENTS.md` when you are actively working inside that folder.
Nested `AGENTS.md` files are local overrides, not a second source of truth.

## Mission
Build **AI Decision Studio by Menoko OG** as a secure Electron desktop application for CTO and product/ops leaders evaluating AI initiatives.

## Product rules
- Offline-first except AI calls
- Export quality is slightly higher priority than import quality
- Mobile-first responsive renderer for narrow windows
- No auth in v1
- OpenAI-compatible provider abstraction from day one
- Deterministic calculators own all numeric outputs
- Include a small built-in template library in v1

## Engineering rules
- TypeScript everywhere
- Strict typing
- No business logic in React components
- No unsafe Electron settings
- No secrets in source control
- Use typed IPC only
- Keep domain logic in packages, not UI layers

## Security rules
- `contextIsolation = true`
- `nodeIntegration = false`
- `sandbox = true`
- No remote code execution
- No renderer filesystem access except through preload bridge
- All AI calls must pass through the app service layer

## AI rules
- AI suggestions are suggestions only
- AI may not silently mutate locked financial values
- All AI outputs must be auditable
- Prompt templates must be versioned
- Calculations remain deterministic and testable

## UX rules
- Must look premium and readable
- Must work well on narrow widths
- Touch-friendly controls
- Clear typography and spacing
- Use responsive layouts that adapt cleanly from mobile-width to desktop-width

## Read these docs next
- `docs/agent/tasks.md`
- `docs/agent/implementation-contract.md`
- `docs/reference/source-analysis.md`
- `docs/reference/product-brief.md`
- Read local nested `AGENTS.md` files only in folders you actively edit
