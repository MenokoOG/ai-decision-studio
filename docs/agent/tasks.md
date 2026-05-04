# TASKS

## Foundation

- [x] Install workspace dependencies
- [x] Wire Electron + Next dev flow (legacy path)
- [x] Add Tailwind and design tokens
- [x] Add shadcn/ui foundation
- [x] Add lint, format, typecheck, test scripts
- [x] Scaffold web runtime under `apps/web`
- [x] Scaffold dedicated backend runtime under `apps/api` (Express + middleware + layered modules)
- [x] Migrate backend runtime to NestJS with versioned API routing and Swagger docs endpoint
- [x] Add deterministic business-case preview API route in web app
- [ ] Build complete web initiative workspace (business case, matrix, roadmap)

## Data

- [x] Finalize Prisma schema
- [x] Create initial migration
- [x] Add seed template library
- [x] Add audit tables
- [ ] Migrate persistence target from SQLite assumptions to Postgres-ready web model

## Domain

- [x] Implement initiative service
- [x] Implement business case service
- [x] Implement decision matrix service
- [x] Implement roadmap service
- [x] Implement export service

## AI

- [x] Build provider settings UI
- [ ] Add OpenAI-compatible client
- [ ] Add test connection action
- [ ] Add guarded prompt templates
- [ ] Add audit logging for AI outputs

## UX

- [x] Home dashboard
- [x] Initiative workspace
- [x] Business case editor
- [x] Decision matrix editor
- [x] Roadmap planner
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
- [x] Roadmap tab now uses persisted editable roadmap phases end-to-end in renderer (`roadmapPhases`, `setRoadmapPhase`, `addRoadmapPhase`, `removeRoadmapPhase`, `persistRoadmap`) with guided save/continue workflow.
- [x] Markdown export is now implemented through typed IPC using persisted initiative, business case, decision matrix, and roadmap data.
- [x] Business Case now uses worksheet-parity structure from original course workbook (sectioned Cost, Benefit, Risk Mitigation rows with one-time and annual inputs).
- [x] Deterministic calculator now projects year-by-year section totals, net yearly values, and running net totals from worksheet rows.
- [x] Business Case renderer was redesigned for professional worksheet UX with mobile-friendly section cards and clearer save/continue actions.
- [x] New web runtime scaffolding was created (`apps/web`) with shared UI primitives and typed utilities.
- [x] Web route `POST /api/business-case/preview` now validates input with zod and calls deterministic shared calculator logic.
- [x] Initial web page (`apps/web/src/app/page.tsx`) now supports worksheet editing and API-backed deterministic preview.
- [x] Web UX now uses button-driven workflow screens with guided tips and a separate quick estimate calculator before worksheet entry.
- [x] Added AI cost readiness capture checklist covering infrastructure, model/API spend, data pipelines, MLOps, talent, integration, security/compliance, reliability/risk, product/UX, finance, legal/IP, and change management.
- [x] Added versioned Nest initiatives CRUD endpoints backed by Prisma persistence (`/api/v1/initiatives`).
- [x] Added initiative workspace draft save/load endpoints (`GET/PATCH /api/v1/initiatives/:id/workspace-state`) and wired web create/list/open/save flow.
- [x] Added auto-save draft cadence (30s), deterministic snapshot endpoints (`POST/GET /api/v1/initiatives/:id/snapshots`), and API-backed confidence scoring (`GET /api/v1/initiatives/:id/confidence`).
- [x] Fixed runtime 500s on initiatives and business-case preview by hardening Nest DI injection in controllers/services used by web persistence flow.
- [x] Improved workspace persistence UX with auto-open most recent initiative, unsaved-changes indicator, autosave status chip, and inline save progress feedback.
- [x] Updated README to reflect current web + NestJS + Prisma stack and removed coding-agent-specific onboarding content.
- [x] Removed readiness notes fields from web checklist UX and applied a premium visual polish pass for end-user presentation.
- [x] Completed broader customer-facing UI refinement across workflow, readiness, and summary sections with richer visual hierarchy and executive KPI framing.
- [x] Corrected worksheet parity calculation model so Year 1 uses one-time + annual values (matching source workbook formula pattern), with updated deterministic expectations.
- [x] Added comprehension-focused UX upgrades: explicit calculator entry, second calculate action lower on page, dedicated Use Cases section, and full Help section.
- [x] Added first-class Prisma schema support for readiness and confidence on `Initiative` plus dedicated `BusinessCaseSnapshot` model.
- [x] Added migration scaffolding for first-class snapshot/readiness persistence (`20260501121500_snapshot_readiness_first_class`).
- [x] Added readiness API contract (`GET/PATCH /api/v1/initiatives/:id/readiness`) and DTO validation.
- [x] Updated initiative snapshot service to first-class persistence with backward-safe audit-event dual-write.
- [x] Updated confidence computation to prefer first-class readiness persistence with legacy workspace fallback.
- [x] Added markdown export readiness section (confidence + checklist rows).
- [x] Added plain-English helper guidance for quick estimate, scope/baseline, worksheet one-time vs annual fields, readiness states, and summary ROI/payback explanations.
- [x] Expanded deterministic calculator assertions with explicit formula and edge-case tests (one-time timing, cumulative totals, ROI/payback null behavior).
- [x] Implement section-form interaction model from workspace launcher (open section -> complete form -> close section).
- [x] Add reusable section form shell component with required controls (`Save`, `Calculate`, `Clear`, `Close`).
- [x] Migrate `Scope & Baseline` into its own section form with save/calculate/clear/close actions.
- [x] Migrate `Costs` into its own section form with save/calculate/clear/close actions.
- [x] Migrate `Benefits` into its own section form with save/calculate/clear/close actions.
- [x] Migrate `Risk Mitigations` into its own section form with save/calculate/clear/close actions.
- [x] Migrate `Readiness` into its own section form with save/calculate/clear/close actions.
- [x] Migrate `Summary` into its own section view with close action and recompute shortcut.
- [x] Ensure every section-level `Calculate` action contributes to and refreshes the shared overall report state.
- [x] Add section-level clear behavior guardrail (confirm before destructive clear).
- [ ] Add mobile QA pass for section form open/close and sticky action controls.
- [x] Added Workspace Launcher hub view with per-section status pills (Ready / Draft / Not started) and `launcher` as the new default workflow screen; ancillary Use Cases and Help blocks now render only on the launcher so section forms stay focused.
- [x] Added Provider Studio UI in web app quick-estimate flow with BYO OpenAI-compatible mode and local-model mode, with client-side validation and draft persistence for non-secret fields (base URL + model + mode).
- [x] Added Cost Intelligence suggestion panel in worksheet sections with searchable source references and one-click row population for cost/benefit/risk assumptions.
- [ ] Replace desktop-first interaction path with full web initiative workflow and persistence.
- [ ] Add provider settings and auditable AI actions through server-side app service layer.
- [x] Apply and verify new Prisma migration in active local DB (`pnpm --filter @ai-cost-tool/db db:migrate`).
- [x] Add idempotent backfill from legacy `AuditEvent` snapshot payloads into `BusinessCaseSnapshot`.
- [x] Verified 2026-05-01 handoff end-to-end on local dev DB (2026-05-03): migration `20260501121500_snapshot_readiness_first_class` applied; backfill script `packages/db/prisma/backfill-snapshots.ts` (npm `db:backfill-snapshots`) inserted 5 legacy snapshots on first run and 0 on second run (idempotent); smoke-tested `GET/PATCH /api/v1/initiatives/:id/readiness`, `GET /api/v1/initiatives/:id/confidence`, `POST/GET /api/v1/initiatives/:id/snapshots` — all 2xx, readiness PATCH persists `Initiative.readinessJson` + `confidenceScore` (83.3 with 2 ready / 1 draft), live snapshot POST received version 5 continuing from backfilled versions 1-4.

## Export

- [x] Markdown export
- [ ] Excel export — xlsx package scaffolding exists in `packages/exporters`, but web API currently serves an Excel-compatible CSV fallback from initiatives endpoints to keep runtime stable when `exceljs` is unavailable.
- [ ] PDF export stub

## Security

- [ ] Add CSP for web runtime
- [ ] Add request validation coverage for all write endpoints
- [ ] Add secure key storage plan
- [ ] Add route-level rate limiting and payload guards
