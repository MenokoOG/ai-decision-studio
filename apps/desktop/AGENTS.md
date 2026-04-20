# AGENTS.md

## Scope
Rules here apply only when editing `apps/desktop`.

## Purpose
This folder owns the legacy Electron shell and migration compatibility surface.

## Rules
- Keep main, preload, and renderer responsibilities separated
- Do not expose unsafe native capabilities to the renderer
- All renderer access to native APIs must go through typed preload contracts
- Keep UI components presentational where possible
- Do not put calculator or persistence logic in React components
- Treat this app as maintenance-only while `apps/web` is the primary product runtime
