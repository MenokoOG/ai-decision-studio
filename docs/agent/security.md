# SECURITY

## Electron
- contextIsolation: true
- nodeIntegration: false
- sandbox: true
- disable remote module
- validate IPC payloads

## Data
- SQLite local store
- API keys stored outside repo, preferably OS keychain later
- redact sensitive data in logs

## AI
- user-provided API key
- explicit connection test
- clear disclosure that AI can be inaccurate
