# AGENTS.md

## Scope
Rules here apply only when editing `apps/web`.

## Purpose
This folder owns the web-first Next.js application experience for AI Decision Studio.

## Rules
- Keep UI mobile-first and responsive.
- Keep business logic in packages or server routes, not React components.
- Use server routes/server actions for persistence and AI orchestration.
- Prefer typed request/response contracts and zod validation at boundaries.
- Keep exports premium-quality and deterministic.
