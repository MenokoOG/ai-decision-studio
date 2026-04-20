# SECURITY

## Web Platform
- Validate all write payloads on server routes/actions
- Keep provider keys server-only
- Apply rate limiting and request size limits to write endpoints
- Keep strict separation between public and server runtime code

## Data
- Postgres + Prisma for persistence
- API keys stored outside repo, preferably managed secret storage
- redact sensitive data in logs

## AI
- user-provided API key
- explicit connection test
- clear disclosure that AI can be inaccurate
- auditable AI output trail for each run
