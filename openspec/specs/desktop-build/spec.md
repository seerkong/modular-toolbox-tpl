# desktop-build Specification

## Purpose
TBD - created by archiving change add-desktop-windows-build. Update Purpose after archive.
## Requirements
### Requirement: OS-aware desktop commands
Desktop workflows SHALL keep using `dev:desktop:vue`, `dev:desktop:react`, `build:desktop:vue`, and `build:desktop:react` while dispatching to platform-specific logic: macOS uses the existing mac bundle flow; Windows uses a Windows bundle flow; unsupported OSes fail with a clear message.

#### Scenario: Build on macOS
- **WHEN** `bun run build:desktop:vue` or `bun run build:desktop:react` runs on macOS
- **THEN** the macOS bundle pipeline executes (no Windows artifacts are produced) and the command succeeds without needing extra flags.

#### Scenario: Build on Windows
- **WHEN** `bun run build:desktop:vue` or `bun run build:desktop:react` runs on Windows
- **THEN** the Windows bundle pipeline executes (no macOS artifacts are produced) and the command succeeds without manual script changes.

#### Scenario: Dev on Windows
- **WHEN** `bun run dev:desktop:vue` or `bun run dev:desktop:react` runs on Windows
- **THEN** the desktop dev runner starts (or reuses) backend and frontend, opens the webview window, and does not rely on mac-only tooling such as `lsof`.

#### Scenario: Unsupported OS guardrail
- **WHEN** a desktop dev/build command runs on an unsupported OS
- **THEN** it exits with a clear message naming supported platforms (macOS, Windows) and does not attempt a partial build.

### Requirement: Windows desktop packaging layout
Windows desktop builds SHALL produce a runnable bundle under `dist/desktop/<shell>/` containing a GUI-subsystem executable built from `desktop/src/main.ts`, a `resources` directory with frontend assets, backend binary, native dependencies (webview.dll, sqlite3 bindings), and required node_modules (webview-bun, bindings, file-uri-to-path, reflect-metadata), matching the runtime’s resource resolution paths.

#### Scenario: Windows build output
- **WHEN** `bun run build:desktop:vue` runs on Windows
- **THEN** `dist/desktop/vue/` contains the desktop executable plus `resources/frontend`, `resources/backend/modular-toolbox-tpl-backend.exe`, `resources/node_modules` with webview-bun + sqlite3 + bindings + file-uri-to-path + reflect-metadata, and `resources/webview.dll` copied from webview-bun.

#### Scenario: Windows build uses compiled backend
- **WHEN** the Windows desktop build compiles backend
- **THEN** it builds the backend binary for Windows with sqlite/reflect externals and places it under `resources/backend/`, and the desktop launcher starts that binary with the correct env vars (dataDir, readyFile, frontendDir, PORT=0).

#### Scenario: Console window hidden
- **WHEN** the Windows desktop executable is produced
- **THEN** it is marked as a GUI subsystem (no console window appears on launch), for example by applying a PE subsystem patch after `bun build --compile`.

### Requirement: Cross-platform dev runner compatibility
The desktop dev runner SHALL work on both macOS and Windows, providing the same port conventions (`APP_DESKTOP_DEV_PORT` override, backend default port), backend reuse best-effort, and graceful cleanup without relying on platform-specific process discovery tools.

#### Scenario: Backend reuse best-effort
- **WHEN** the desktop dev runner executes on Windows
- **THEN** it either reuses an existing backend if detected with a Windows-compatible check or starts a new backend, and continues startup without failing on missing mac tools.

#### Scenario: Cleanup on exit
- **WHEN** the dev webview window closes or the process receives SIGINT/SIGTERM on Windows
- **THEN** the runner stops spawned backend/frontend processes and exits cleanly without orphaned children or hung ports.

