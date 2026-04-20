# System Design

- Next.js web app as primary runtime
- Dedicated backend API service (`apps/api`, Express + TypeScript) for middleware, validation, and service-layer orchestration
- Next.js route handlers/server actions remain available for web-local BFF use cases
- Typed domain and calculator packages shared across runtimes
- Postgres + Prisma for persistence
- OpenAI-compatible AI provider adapter
