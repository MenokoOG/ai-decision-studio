# System Design

- Next.js web app as primary runtime
- Dedicated backend API service (`apps/api`, NestJS + TypeScript) for middleware, validation, and service-layer orchestration
- Versioned API strategy (`/api/v1/*`) with Swagger docs and Compodoc output
- Next.js route handlers/server actions remain available for web-local BFF use cases
- Typed domain and calculator packages shared across runtimes
- Postgres + Prisma for persistence
- OpenAI-compatible AI provider adapter
