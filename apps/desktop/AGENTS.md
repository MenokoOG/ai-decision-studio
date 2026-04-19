# AGENTS.md

## Scope
Rules here apply only when editing `apps/desktop`.

## Purpose
This folder owns the Electron shell, preload bridge, and Next.js renderer.

## Rules
- Keep main, preload, and renderer responsibilities separated
- Do not expose unsafe native capabilities to the renderer
- All renderer access to native APIs must go through typed preload contracts
- Keep UI components presentational where possible
- Do not put calculator or persistence logic in React components
