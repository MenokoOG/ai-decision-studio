# Threat Model

## Main Risks
- Unsafe Electron settings
- Secrets leakage
- Unvalidated IPC payloads
- AI overreach into deterministic workflows

## Controls
- Hardened BrowserWindow
- Typed IPC
- No auth in v1, local-only data
- AI suggestions separated from committed values
