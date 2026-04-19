Build this repository into a polished Electron desktop application named **AI Decision Studio by Menoko OG**.

Read these files first, in order:
1. `AGENTS.md`
2. `docs/agent/tasks.md`
3. `docs/agent/implementation-contract.md`
4. `docs/reference/source-analysis.md`
5. `docs/reference/product-brief.md`
6. nested `AGENTS.md` files only inside folders you actively edit

Execution rules:
- Keep the repo name as `ai-cost-tool`
- Keep the app title as **AI Decision Studio**
- Show **by Menoko OG** in branding surfaces
- Use Electron + Next.js renderer + TypeScript + Tailwind + SQLite + Prisma
- Keep the product fully usable offline except AI calls
- Use an OpenAI-compatible provider abstraction from day one
- Do not add Nest in v1
- Optimize for mobile-sized windows and responsive layouts
- Prioritize clean export quality slightly higher than import quality
- Include a small built-in template library from the industry workbook in v1
- Keep all numeric logic deterministic and testable
- Do not let AI mutate locked financial values without explicit confirmation
- Maintain Electron security: contextIsolation on, nodeIntegration off, sandbox on

Working style:
- Complete work in small, reviewable commits
- Update `docs/agent/tasks.md` as tasks are completed
- Record architectural decisions in `docs/agent/decisions.md`
- Preserve clean, high-legibility UI with premium styling
- Prefer shadcn/ui patterns and accessible components

Start with Phase 1 in `docs/agent/tasks.md`, then continue sequentially unless blocked.
