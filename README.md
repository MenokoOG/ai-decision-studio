# AI Decision Studio

**by Menoko OG**

Premium web-first product for evaluating AI initiatives with deterministic financial clarity.

## What this repo is

AI Decision Studio is a monorepo for a web-first decision platform:

- `apps/web`: Next.js 15 + TypeScript + Tailwind frontend (primary runtime)
- `apps/api`: NestJS 11 + Swagger + Prisma backend (versioned API under `/api/v1`)
- `packages/calculators`: deterministic business-case math engine
- `packages/db`: Prisma schema, migrations, and seed tooling
- `apps/desktop`: maintenance-only while web migration completes

## Start

```bash
pnpm install
pnpm dev:full
```

## Useful Commands

```bash
pnpm dev:full
pnpm dev:web
pnpm dev:api
pnpm dev:desktop
pnpm --filter web typecheck
pnpm --filter api typecheck
pnpm --filter api docs:api
```

## Local URLs

- Web app: `http://localhost:3100`
- API app: `http://localhost:4000`
- Swagger docs: `http://localhost:4000/api/docs`
- Versioned API base: `http://localhost:4000/api/v1`

## Product Direction

- Guided workflow UX for initiative planning, readiness tracking, and deterministic ROI analysis
- Online-first persistence with draft save/load behavior
- `original-worksheets` artifacts are the parity source for worksheet field coverage

## Notes

- Core calculation outputs are deterministic and auditable.
- No auth in v1.
