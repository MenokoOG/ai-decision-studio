# AGENT.md

## Mission
Ship AI Decision Studio as a secure, premium-feeling web application with a strong service boundary.

## Users
- CTO
- Product leaders
- Operations leaders

## Product Pillars
1. Strategic business case
2. AI decision support
3. Roadmap execution planning
4. Guarded AI assistance
5. High-quality exports

## Architecture
- Next.js web app (`apps/web`)
- Route handlers and server actions as the initial BFF layer
- TypeScript
- Postgres + Prisma (target)
- Deterministic calculators
- OpenAI-compatible provider abstraction

## Done Means
- User can create initiative
- User can model 5-year costs and benefits
- User can compare AI options
- User can track roadmap phases
- User can connect an AI provider
- User can export clean outputs
- User workflows run through typed server/API boundaries rather than client-side direct data access

## Never Do
- Do not put secrets in repo
- Do not let AI own calculations
- Do not bypass server-side validation on write APIs
- Do not expose provider keys in client bundles
