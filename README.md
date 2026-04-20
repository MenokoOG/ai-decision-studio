# AI Decision Studio

**by Menoko OG**

Premium web-first workspace for evaluating AI initiatives.

## What this repo is

Web-first platform built with Next.js, TypeScript, Tailwind, Prisma, deterministic calculators, and a guarded AI assistant.

`apps/web` is the primary runtime. `apps/desktop` remains available as a transitional shell while migration completes.

## Start

```bash
pnpm install
pnpm dev
```

## Useful Commands

```bash
pnpm dev:web
pnpm dev:api
pnpm dev:desktop
pnpm --filter web typecheck
```

## Frontend <-> Backend

- Web app runs on `http://localhost:3100`
- API app runs on `http://localhost:4000`
- Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` in the web environment to call the dedicated backend.

## For coding agents

Read in this order:

1. `AGENTS.md`
2. `docs/agent/tasks.md`
3. `docs/agent/implementation-contract.md`
4. `docs/reference/source-analysis.md`
5. `docs/reference/product-brief.md`
6. nested `AGENTS.md` only for folders you are editing

## Notes

- Core workflows are server-backed; AI still requires provider connectivity.
- AI features require a user-provided API key.
- No auth in v1.
