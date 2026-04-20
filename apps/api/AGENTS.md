# AGENTS.md

## Scope
Rules here apply only when editing apps/api.

## Purpose
This folder owns the dedicated NestJS backend API service for AI Decision Studio.

## Rules
- Keep clean separation: routes -> controllers -> services -> domain packages.
- Keep middleware centralized and composable.
- Validate all write payloads using DTOs and global validation pipes at API boundaries.
- Keep controllers thin and move business logic into services/packages.
- Return consistent HTTP error shapes from global error middleware.
- Keep APIs versioned (`/api/v1/*` and forward-compatible version strategy).
- Keep Swagger docs up-to-date for all public endpoints.
- Keep Compodoc output usable for backend maintainers.
