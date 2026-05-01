# Technical Handoff - AI Decision Studio

Date: 2026-04-28
Repository: ai-cost-tool-starter-ai-decision-studio-harness-clean
Branch: next-step

## 1) Project Purpose

AI Decision Studio is a web-first decision platform for CTO, product, and operations leaders to evaluate AI initiatives with deterministic financial outputs.

Primary goals:

- Build initiative business cases with worksheet-parity cost and benefit modeling.
- Expose delivery risk through readiness tracking.
- Persist draft and snapshot history for iterative planning.
- Keep AI assistance optional, auditable, and non-authoritative for numeric outputs.

## 2) Current Features

Implemented now:

- Initiative workspace creation, listing, selection, update, deletion (Nest API + Prisma persistence).
- Guided web workflow with section-based screens:
  - Quick estimate
  - Scope and baseline
  - Costs
  - Benefits
  - Risk mitigations
  - Readiness checklist
  - Decision summary
- Deterministic business-case calculator shared across web and API.
- API-backed preview calculation endpoint.
- Workspace draft save/load and 30-second autosave.
- Snapshot save/list and confidence score derived from readiness statuses.
- Seeded template library in database.
- Swagger docs for API discovery.
- Legacy desktop runtime remains available in maintenance mode.

## 3) Folder Structure

Top-level intent:

- apps/web: Primary Next.js product runtime.
- apps/api: NestJS backend with versioned endpoints.
- apps/desktop: Legacy Electron runtime (maintenance-only).
- packages/calculators: Deterministic business logic for financial outputs.
- packages/db: Prisma schema, migrations, seed scripts.
- packages/ai: Provider abstraction scaffold (currently minimal).
- packages/exporters: Markdown export generation.
- packages/domain and packages/shared: Shared types/constants.
- docs: Product, architecture, and agent handoff/reference docs.
- original-worksheets: Source parity artifacts for worksheet and financial flow.

## 4) Tech Stack

Core:

- Monorepo: pnpm workspaces + Turborepo.
- Language: TypeScript across runtime packages.

Web:

- Next.js 15
- React 19
- Tailwind CSS
- Zod validation in web route handlers

API:

- NestJS 11
- class-validator + class-transformer DTO validation
- Swagger via @nestjs/swagger

Data:

- Prisma ORM
- Current datasource configured as SQLite in schema (dev.db present)
- Product direction docs indicate Postgres target

Shared logic:

- Deterministic calculator package used by both web and API

Desktop (legacy):

- Electron + preload bridge + IPC channels

## 5) Main Files and What They Do

Runtime entrypoints:

- apps/web/src/app/page.tsx: Main client workflow UI, initiative operations, autosave, calculator invocation, readiness tracking.
- apps/web/src/app/layout.tsx: App shell and metadata.
- apps/web/src/app/api/business-case/preview/route.ts: Local fallback preview endpoint with Zod validation.
- apps/api/src/main.ts: Nest bootstrap, CORS, global prefix/versioning, validation pipe, Swagger setup.
- apps/api/src/app.module.ts: API module composition.

API modules:

- apps/api/src/modules/business-case/business-case.controller.ts: Health + deterministic preview endpoint.
- apps/api/src/modules/business-case/business-case.service.ts: Delegates to shared calculator package.
- apps/api/src/modules/initiatives/initiatives.controller.ts: Initiative CRUD + workspace state + confidence + snapshots.
- apps/api/src/modules/initiatives/initiatives.service.ts: Prisma-backed persistence and derived confidence logic.

Validation/contracts:

- apps/api/src/modules/business-case/dto/business-case-preview.dto.ts: Preview payload validation schema.
- apps/api/src/modules/initiatives/dto/\*.ts: Create/update/save payload schemas.

Data and domain:

- packages/db/prisma/schema.prisma: Canonical data model.
- packages/db/prisma/seed.ts: Seed template records + system audit event.
- packages/calculators/src/businessCase.ts: Deterministic projection and summary calculations.
- packages/ai/src/provider.ts: Placeholder provider config contract and connection stub.
- packages/exporters/src/markdown.ts: Initiative markdown export composition.

## 6) Current User Flow

Current web-first flow:

1. Open web app.
2. Create a new initiative (title, summary, owner) or open an existing one.
3. Optionally run Quick Estimate and Usage Scaling calculators.
4. Fill Scope and Baseline fields.
5. Enter worksheet values in Costs, Benefits, and Risk Mitigations.
6. Mark readiness categories as Unknown, Draft, or Ready.
7. Click Calculate to call preview endpoint and compute deterministic outputs.
8. View Decision Summary metrics (TCO, benefit, net value, ROI, payback, readiness snapshot).
9. Draft state autosaves every 30 seconds when dirty.
10. Snapshots are stored on calculation for initiative version history.

## 7) API Endpoints

Base URL:

- API runtime base: /api/v1 (default localhost:4000)

Business case:

- GET /api/v1/business-case/health
  - Module health check.
- POST /api/v1/business-case/preview
  - Validated deterministic preview calculation.

Initiatives:

- GET /api/v1/initiatives
  - List initiatives.
- GET /api/v1/initiatives/:id
  - Get initiative by id.
- POST /api/v1/initiatives
  - Create initiative.
- PATCH /api/v1/initiatives/:id
  - Update initiative metadata.
- DELETE /api/v1/initiatives/:id
  - Delete initiative and related records.

Workspace state and analytics:

- GET /api/v1/initiatives/:id/workspace-state
  - Read latest saved draft payload.
- PATCH /api/v1/initiatives/:id/workspace-state
  - Save latest draft payload.
- GET /api/v1/initiatives/:id/confidence
  - Derived readiness confidence score.

Snapshots:

- GET /api/v1/initiatives/:id/snapshots
  - List latest deterministic snapshots.
- POST /api/v1/initiatives/:id/snapshots
  - Save snapshot payload.

Web-local fallback route:

- POST /api/business-case/preview (Next route handler)
  - Same deterministic calculation path for local/web-only fallback.

## 8) Data Models / Schemas

Prisma models (key):

- Initiative
- CostLine
- BenefitLine
- Decision
- RoadmapPhase
- Template
- AuditEvent
- AIRun
- FinancialLockConfirmation

Notable enums:

- InitiativePhase: DISCOVERY, DESIGN, BUILD, PILOT, SCALE, GOVERNANCE
- LineType: COST, BENEFIT
- ActorType: USER, AI, SYSTEM

Current persistence pattern:

- Initiative entity is first-class.
- Workspace draft and snapshots are currently event-backed via AuditEvent payload JSON (not dedicated first-class snapshot/readiness tables yet).

Validation schemas:

- API DTOs enforce write payload constraints with whitelist and forbidNonWhitelisted.
- Web route uses Zod for local preview endpoint validation.

## 9) AI Integrations

Current state:

- AI provider package exists but is minimal scaffold only.
- packages/ai/src/provider.ts defines:
  - ProviderConfig (baseUrl, apiKey, model)
  - ChatRequest contract
  - testProviderConnection stub that only checks required fields

What is not yet present:

- No real model invocation client.
- No provider settings UI in web.
- No prompt template execution path.
- No AI audit pipeline wired into AIRun and FinancialLockConfirmation models.

## 10) What Is Incomplete or Broken

Known incomplete areas:

- AI feature set is scaffolded, not implemented end-to-end.
- Export parity is incomplete:
  - Markdown export exists in package layer.
  - Excel/PDF export paths are not complete.
- Security hardening backlog still open:
  - CSP for web runtime
  - Broader request validation coverage and payload guards
  - Rate limiting
  - Secure key storage plan
- Data target mismatch:
  - Docs/platform direction indicate Postgres target.
  - Active Prisma datasource is SQLite.
- Readiness/snapshot storage design:
  - Important workflow data is still primarily in audit-event JSON payloads instead of dedicated tables.
- Product/documentation drift exists in places (older docs mention non-goals that conflict with current backend state).
- Automated tests are sparse in many packages (several scripts remain placeholder/pending).

## 11) How to Run Locally

Prerequisites:

- Node.js compatible with workspace tooling
- pnpm 10

Install:

- pnpm install

Recommended env setup:

- Set DATABASE_URL for Prisma.
- For current schema, SQLite example:
  - DATABASE_URL="file:./packages/db/prisma/dev.db"
- Optional web-to-api explicit wiring (already set in dev:full script):
  - NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"

Run web + API together:

- pnpm dev:full

Run individually:

- pnpm dev:web
- pnpm dev:api

Optional DB commands:

- pnpm --filter @ai-cost-tool/db db:generate
- pnpm --filter @ai-cost-tool/db db:migrate
- pnpm --filter @ai-cost-tool/db db:seed

Useful URLs:

- Web: http://localhost:3100
- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

## 12) What Needs To Happen To Make This a Sellable MVP

Priority roadmap:

1. Finish reliable core workflow packaging

- Complete section-form interaction model (save/calculate/clear/close behavior).
- Ensure every section consistently updates deterministic summary state.

2. Solidify persistence model

- Promote workspace state, readiness, and snapshots to first-class Prisma tables.
- Keep immutable snapshot versioning and better queryability.

3. Implement real AI value safely

- Add provider settings UI and secure server-side key handling.
- Implement OpenAI-compatible runtime client and connection tests.
- Add versioned prompts + auditable AI run records.
- Enforce lock-confirmation flow for any AI-proposed financial field edits.

4. Deliver stakeholder-grade outputs

- Finish PDF and spreadsheet export pathways.
- Include initiative context, assumptions, deterministic outputs, confidence/readiness, and recommendation framing.

5. Close security and reliability gaps

- CSP, rate limiting, payload guards, and stronger API abuse controls.
- Logging/monitoring and error observability for production readiness.

6. Align platform data target and deployment path

- Complete migration from SQLite assumptions to Postgres-ready production model.
- Add environment templates and reproducible local/prod config.

7. Add commercial readiness

- Introduce account/org model and usage metering.
- Add at least one billing-gated premium capability.
- Define launch metrics and design-partner feedback loop.

---

If you continue from this handoff, the most leveraged next implementation slice is:

- First-class snapshot/readiness schema migration + API response update + export integration.
