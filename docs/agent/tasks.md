# TASKS

## Foundation

- [x] Install workspace dependencies
- [x] Wire Electron + Next dev flow
- [x] Add Tailwind and design tokens
- [x] Add shadcn/ui foundation
- [x] Add lint, format, typecheck, test scripts

## Data

- [x] Finalize Prisma schema
- [x] Create initial migration
- [x] Add seed template library
- [x] Add audit tables

## Domain

- [x] Implement initiative service
- [x] Implement business case service
- [x] Implement decision matrix service
- [ ] Implement roadmap service
- [ ] Implement export service

## AI

- [ ] Build provider settings UI
- [ ] Add OpenAI-compatible client
- [ ] Add test connection action
- [ ] Add guarded prompt templates
- [ ] Add audit logging for AI outputs

## UX

- [x] Home dashboard
- [x] Initiative workspace
- [x] Business case editor
- [x] Decision matrix editor
- [ ] Roadmap planner
- [ ] Settings screen

## Current Progress Notes

- [x] Typed IPC bridge now exposes template listing and deterministic business-case preview.
- [x] Template library now loads from local SQLite seeded records, not renderer mocks.
- [x] Home workflow includes editable assumptions with deterministic TCO, benefit, ROI, and payback outputs.
- [x] Users can now create initiatives from templates and reopen persisted initiative workspaces.
- [x] Business-case assumptions can now be saved to SQLite-backed initiative records and reloaded.
- [x] Initiative workspace is now organized into tabs (Business Case, Decision Matrix, Roadmap).
- [x] Business Case tab remains fully functional with deterministic calculation and save/reload flow.
- [x] Tabs now include guided step navigation so users can progress through the workflow as they complete fields.
- [x] Decision Matrix tab now supports editable options with deterministic weighted scoring and SQLite-backed save/load.

## Export

- [ ] Markdown export
- [ ] Excel export
- [ ] PDF export stub

## Security

- [ ] Harden BrowserWindow
- [ ] Add secure key storage plan
- [ ] Add CSP
- [ ] Add IPC validation
