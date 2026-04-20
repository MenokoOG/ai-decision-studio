# AGENTS.md

## Scope
Rules here apply only when editing apps/api.

## Purpose
This folder owns the dedicated backend API service for AI Decision Studio.

## Rules
- Keep clean separation: routes -> controllers -> services -> domain packages.
- Keep middleware centralized and composable.
- Validate all write payloads using zod schemas at API boundaries.
- Keep controllers thin and move business logic into services/packages.
- Return consistent HTTP error shapes from global error middleware.
