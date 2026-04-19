# AGENTS.md

## Scope
Rules here apply only when editing `packages/db`.

## Rules
- Prisma schema is the source of truth for persistence
- Document migrations clearly
- Preserve backward-safe local data evolution where possible
- Do not leak persistence concerns into UI components
