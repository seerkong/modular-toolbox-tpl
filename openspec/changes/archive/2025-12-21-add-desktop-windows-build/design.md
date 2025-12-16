## Context
- Desktop build currently supports only macOS via `desktop/scripts/build-macos.ts`, producing `.app/Contents/{MacOS,Resources}` with compiled desktop binary, backend binary, frontend assets, and native deps.
- Desktop runtime (`desktop/src/main.ts`) already has platform checks for Windows (uses `webview.dll`, expects backend binary with `.exe` on win32, resolves resources under a `resources` directory next to the executable), but the build pipeline does not produce those assets on Windows.
- Root commands `dev:desktop:*` and `build:desktop:*` call macOS-only scripts, making Windows invocations fail. Dev runner uses `lsof` to find PIDs, which is mac/Linux specific.
- Reference project `project-counter-countdown-win` shows a Windows flow: bun compile to `.exe`, then post-process PE subsystem (hide console) via `exe_enhancement/hidecmd.ts`.

## Goals
- Keep `dev:desktop:vue|react` and `build:desktop:vue|react` as the only entrypoints; choose platform-specific logic automatically.
- Produce a Windows desktop bundle that matches the runtime’s resource expectations: `dist/desktop/<shell>/ModularToolboxTpl.exe` (or launcher name) plus `resources/{frontend,backend,node_modules,webview.dll}`.
- Ensure backend binary is compiled for Windows and placed under `resources/backend/`, with required native dependencies copied (sqlite3, bindings, file-uri-to-path, reflect-metadata).
- Avoid mac-only tooling in desktop dev flow; keep parity on port/env behavior and backend reuse where possible.

## Non-Goals
- No change to business logic or module manifests.
- No change to macOS packaging flow beyond adding OS dispatch.
- No signing/notarization; Windows build focuses on unsigned local bundles.

## Decisions
- **Capability scope**: introduce `desktop-build` capability to cover cross-platform desktop packaging and dev commands.
- **OS dispatch**: Implement a small Node/Bun dispatcher (e.g., `desktop/scripts/run-desktop.ts`) invoked by root scripts to call `build-macos.ts` on `darwin`, `build-windows.ts` on `win32`, and fail with a clear message otherwise.
- **Windows packaging layout**: output to `dist/desktop/<shell>/` with:
  - `ModularToolboxTpl.exe` (GUI subsystem) built from `desktop/src/main.ts` with externals `webview-bun`, `sqlite3`, `reflect-metadata`.
  - `resources/frontend/` copied from `dist/web/<shell>/public`.
  - `resources/backend/{modular-toolbox-tpl-backend.exe}` compiled from backend package with sqlite/reflect externals.
  - `resources/node_modules/webview-bun` plus `webview.dll` copied from its `build/` folder, and `sqlite3`, `bindings`, `file-uri-to-path`, `reflect-metadata` copied from backend/node_modules.
- **Console hiding**: reuse the PE subsystem patch approach (like `exe_enhancement/hidecmd.ts`) after bun compile to ensure no console window appears on launch.
- **Dev flow on Windows**: keep `desktop/src/dev.ts` but replace `lsof` with a cross-platform alternative (e.g., `netstat -ano` parsing on win32 or skip reuse attempt) so `bun run dev:desktop:<shell>` works without mac tools.

## Risks / Mitigations
- **Native dep resolution differences**: bun/Node path resolution for sqlite3 bindings may differ on Windows; mitigate by resolving from backend/node_modules and copying the resolved directory.
- **Webview binary location**: ensure `WEBVIEW_PATH` points to the copied `webview.dll`; verify resources layout matches `resolveResourcesBase` candidates.
- **Port reuse on Windows**: if backend reuse detection fails, always start a fresh backend to avoid hanging; document fallback.
- **Binary names**: need to ensure `AppConstConfig` values (backendBinaryName/desktopBinaryName/launcherName) align with exe naming; update constants if required while keeping macOS names unchanged.

## Open Questions
- Should Windows output include an `.ico` or manifest for file properties? (not required for this change but could be a follow-up).
- Do we need a portable archive format (zip) for distribution? (out of current scope).
