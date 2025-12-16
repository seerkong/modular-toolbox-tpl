# Change: Add Windows desktop build and OS-aware desktop commands

## Why
- Current desktop build pipeline only targets macOS and breaks on Windows, but the project now needs to compile and run the webview-bun desktop app on Windows.
- Root desktop scripts (`dev:desktop:*`, `build:desktop:*`) should remain the entrypoints while choosing the correct platform flow automatically.

## What Changes
- Add a Windows packaging flow for the desktop app (webview-bun) that bundles frontend assets, backend binary, and native deps (webview, sqlite3).
- Make desktop dev/build scripts OS-aware so the existing commands dispatch to the correct macOS or Windows path and fail clearly on unsupported hosts.
- Adjust desktop dev tooling to avoid mac-only utilities and keep UX parity (ports, reuse backend where possible).

## Impact
- Affected specs: desktop-build (new)
- Affected code: root package scripts, desktop build scripts, desktop dev runner, shared constants for platform naming if needed
