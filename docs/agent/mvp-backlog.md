# MVP Build Backlog (ROI-First SaaS)

## Objective
Ship a revenue-capable web MVP that helps leaders make AI go/no-go decisions using deterministic ROI outputs, explicit readiness gaps, and exportable summaries.

## Epic 1: Project Intake and Persistence
Goal: Let users create, save, reopen, and update initiative workspaces.

### User Stories
- As a user, I can create an initiative so I can start a business case workflow.
- As a user, I can reopen an initiative so I can continue work later.
- As a user, I can update initiative metadata so stakeholders have current context.

### API Contracts
- `POST /api/v1/initiatives`
  - Request: `{ title, summary, owner, phase? }`
  - Response: `{ id, title, summary, owner, phase, createdAt, updatedAt }`
- `GET /api/v1/initiatives`
  - Response: `[{ id, title, summary, owner, phase, createdAt, updatedAt }]`
- `GET /api/v1/initiatives/:id`
  - Response: `{ id, title, summary, owner, phase, createdAt, updatedAt }`
- `PATCH /api/v1/initiatives/:id`
  - Request: partial `{ title?, summary?, owner?, phase? }`
  - Response: updated initiative
- `DELETE /api/v1/initiatives/:id`
  - Response: `{ deleted: true, id }`

### Schema Changes
- No schema changes required for initial CRUD because `Initiative` model already exists.

### Acceptance Criteria
- All write endpoints reject invalid payloads with server-side validation.
- All endpoints are exposed in Swagger docs.
- Initiative records persist and can be retrieved after restart.

## Epic 2: ROI Engine and Decision Summary
Goal: Produce a deterministic output that can support real go/no-go decisions.

### User Stories
- As a user, I can run deterministic calculations from worksheet input.
- As a user, I can see net impact and payback timing.
- As a user, I can compare output horizon views.

### API Contracts
- Existing: `POST /api/v1/business-case/preview`
- Add: `POST /api/v1/business-case/scenario-compare`
  - Request: `{ baseline, scenarios[] }`
  - Response: deterministic per-scenario comparison metrics

### Schema Changes
- Add `BusinessCaseSnapshot` table for saved assumption versions.
- Fields: `initiativeId`, `version`, `inputJson`, `resultJson`, `createdAt`, `createdBy`.

### Acceptance Criteria
- Numeric outputs are generated only by deterministic calculators.
- Scenario output includes baseline deltas and payback comparison.
- Saved snapshots are immutable once created.

## Epic 3: Readiness and Confidence Scoring
Goal: Expose hidden execution risk so ROI has context.

### User Stories
- As a user, I can track readiness status for each major AI cost/risk category.
- As a user, I can add notes to unresolved gaps.
- As a user, I can see a confidence score before socializing ROI.

### API Contracts
- `PUT /api/v1/initiatives/:id/readiness`
  - Request: `{ items: { key, status, notes }[] }`
  - Response: `{ initiativeId, items, completionPercent, unknownCount }`
- `GET /api/v1/initiatives/:id/readiness`
  - Response: readiness payload

### Schema Changes
- Add `readinessJson Json?` to `Initiative`.
- Add `confidenceScore Float @default(0)` to `Initiative`.

### Acceptance Criteria
- All 12 readiness categories are storable and retrievable.
- Summary returns unknown and draft gaps.
- Confidence score is deterministic from readiness completion rules.

## Epic 4: Exports and Shareability
Goal: Turn analysis into stakeholder-ready deliverables.

### User Stories
- As a user, I can export a clean summary for finance and exec review.
- As a user, I can share a read-only report with decision stakeholders.

### API Contracts
- `POST /api/v1/exports/initiative/:id/markdown`
- `POST /api/v1/exports/initiative/:id/pdf`
- `POST /api/v1/initiatives/:id/share-links`

### Schema Changes
- Add `ShareLink` table: `id`, `initiativeId`, `token`, `expiresAt`, `createdAt`, `revokedAt`.

### Acceptance Criteria
- Export contains assumptions, deterministic outputs, readiness gaps, and recommendation notes.
- Share links can be revoked.

## Epic 5: SaaS Commercial Foundation
Goal: Enable paid usage and controlled scale.

### User Stories
- As an owner, I can subscribe and manage plan limits.
- As a team member, I can work within workspace quotas.

### API Contracts
- `POST /api/v1/billing/checkout-session`
- `GET /api/v1/billing/subscription`
- `POST /api/v1/billing/webhooks`

### Schema Changes
- Add `Account`, `Organization`, `Membership`, `Subscription`, `UsageMeter` tables.
- Keep this behind feature flag while no-auth v1 remains active.

### Acceptance Criteria
- Usage limits are enforceable per workspace/organization.
- Billing status controls premium features.

## Weekly Milestones (8 Weeks)
- Week 1: Initiative CRUD API + web integration for save/load list.
- Week 2: Snapshot model and saved deterministic outputs.
- Week 3: Readiness persistence and confidence scoring API.
- Week 4: Summary page with risk-gap and confidence narratives.
- Week 5: Markdown/PDF export service and API endpoints.
- Week 6: Scenario compare API and UI.
- Week 7: Pilot telemetry, API hardening, rate limits, payload guards.
- Week 8: Pricing gates, launch checklist, first design-partner rollout.

## Definition of MVP Done
- Users can create and persist initiatives.
- Users can run deterministic ROI outputs and save snapshots.
- Users can track readiness and confidence.
- Users can export stakeholder-grade summaries.
- At least one premium capability is billing-gated.