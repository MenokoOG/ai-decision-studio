# Handoff Snapshot - 2026-05-03 (Dinner)

## Active Focus

This is the only active handoff in `docs/agent/`.
All previous dated handoffs are archived for reference only.

## Current Baseline (Verified)

- `pnpm --filter api typecheck` passes.
- `pnpm --filter web typecheck` passes.
- `pnpm --filter web build` passes.
- `pnpm --filter @ai-cost-tool/exporters typecheck` passes.
- Web includes Provider Studio UI and Cost Intelligence suggestion panel.
- API initiative export endpoints currently serve Excel-compatible CSV + Markdown.

## Ordered Next Tasks (Do In Sequence)

### 1) Restore true `.xlsx` export end-to-end

Priority: P0

Goal:
Replace CSV fallback with real `.xlsx` export at runtime and keep Markdown export intact.

Scope:

- Rewire API initiatives export service/controller to use `@ai-cost-tool/exporters` excel builder.
- Keep CSV fallback only behind explicit contingency flag if needed.
- Ensure web export label/name matches actual file type.

Target files:

- `apps/api/src/modules/initiatives/initiatives.service.ts`
- `apps/api/src/modules/initiatives/initiatives.controller.ts`
- `apps/api/package.json`
- `apps/web/src/components/app-header.tsx`
- `apps/web/src/app/page.tsx`

Acceptance criteria:

- `GET /api/v1/initiatives/:id/export/excel` responds with:
  - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition` filename ending in `.xlsx`
- Downloaded file opens in Excel/LibreOffice with multiple sheets.
- `pnpm --filter api typecheck` and `pnpm --filter api build` pass.

---

### 2) Add server-side provider connection test (BYO API + local model)

Priority: P0

Goal:
Move provider validation from UI-only checks to a real backend handshake endpoint.

Scope:

- Add versioned endpoint for provider test, e.g. `POST /api/v1/ai/provider/test`.
- Validate payload with DTO + class-validator.
- Perform safe lightweight probe request against OpenAI-compatible endpoint.
- Return structured result: `{ ok, latencyMs, model, message }`.
- Do not persist API keys in DB or logs.

Target files:

- `apps/api/src/modules/*` (new `ai` module or existing service boundary)
- `apps/web/src/app/page.tsx` (wire button to call endpoint)
- `packages/ai/src/provider.ts` (expand adapter contract if needed)

Acceptance criteria:

- Cloud mode with valid key returns `ok: true`.
- Local mode endpoint can validate without cloud key where supported.
- Failed auth/network returns user-safe error message.
- No secrets printed in logs or saved in workspace state.

---

### 3) Make Cost Intelligence production-grade

Priority: P1

Goal:
Upgrade suggestion quality and trust signals so executives can rely on sources quickly.

Scope:

- Add metadata per source suggestion:
  - confidence score (0-100)
  - region
  - currency
  - source freshness date
- Add filters in UI for section + region + currency + confidence threshold.
- Keep one-click apply into worksheet rows.
- Add “applied from source” note trail in UI state (non-financial metadata only).

Target files:

- `apps/web/src/lib/studio-assist.ts`
- `apps/web/src/app/page.tsx`

Acceptance criteria:

- Suggestions are searchable and filterable.
- Applied suggestions visibly show origin/source context.
- UX remains clean on narrow/mobile widths.

---

### 4) Mobile QA + polish pass for MVP readiness

Priority: P1

Goal:
Complete the remaining UX checklist item and ensure touch-first quality.

Scope:

- Validate key flows at narrow widths:
  - section open/close
  - sticky action controls
  - initiatives panel
  - provider studio block
  - cost intelligence panel
- Fix overflow, tap target, spacing, and readability issues.
- Confirm no regression in launcher and summary views.

Target files:

- `apps/web/src/app/page.tsx`
- `apps/web/src/components/*`
- `apps/web/src/app/globals.css`

Acceptance criteria:

- No horizontal scroll on common phone widths.
- Buttons remain reachable and legible.
- Build/typecheck remain green.

---

### 5) Documentation and handoff hygiene update

Priority: P2

Goal:
Keep agent docs trustworthy and reduce confusion for next execution.

Scope:

- Update task checkboxes in `docs/agent/tasks.md` after each completed step.
- Add decisions in `docs/agent/decisions.md` only for long-lived architecture choices.
- Write a new dated handoff only if significant work is completed.

Acceptance criteria:

- `docs/agent/README.md` points to current active handoff.
- `docs/agent/memory.md` points to current active handoff.
- Previous handoffs remain archived and discoverable by index.

## Quick Resume Commands

```bash
pnpm --filter api typecheck
pnpm --filter api build
pnpm --filter web typecheck
pnpm --filter web build
pnpm --filter @ai-cost-tool/exporters typecheck
```

## Suggested Next Prompt

"Continue from `docs/agent/handoff-2026-05-03-dinner.md` and execute Task 1 fully (restore real .xlsx export), including verification commands and docs updates when done."
