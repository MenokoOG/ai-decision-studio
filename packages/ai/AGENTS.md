# AGENTS.md

## Scope
Rules here apply only when editing `packages/ai`.

## Rules
- Support OpenAI-compatible providers first
- Keep provider logic behind a stable adapter interface
- Version prompt templates
- Prefer structured outputs when feasible
- Never let AI directly commit locked financial changes
- Emit auditable metadata for AI actions
