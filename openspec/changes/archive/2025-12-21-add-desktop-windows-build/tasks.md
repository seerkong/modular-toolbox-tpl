## 1. Investigate
- [x] 1.1 Review existing macOS desktop build pipeline (`desktop/scripts/build-macos.ts`) and desktop bootstrap expectations (resource layout, binary names).
- [x] 1.2 Inspect desktop dev runner for mac-only assumptions (e.g., lsof) and webview-bun usage.
- [x] 1.3 Review `AppConstConfig` for platform naming and output paths.

## 2. Design & Platform Hooks
- [x] 2.1 Outline Windows packaging layout (exe + resources) to satisfy current bootstrap resolution.
- [x] 2.2 Decide on OS-aware entrypoint strategy for `dev:desktop:*` / `build:desktop:*` (dispatch script vs. inline detection).
- [x] 2.3 Specify how to copy native deps on Windows (webview.dll, sqlite3, bindings) and hide console window.

## 3. Implement Windows Build Path
- [x] 3.1 Add Windows build script mirroring mac bundle steps: build frontend if missing, compile desktop launcher, compile backend binary, copy resources/node_modules/native libs to `dist/desktop/<shell>/resources`.
- [x] 3.2 Wire root `build:desktop:<shell>` commands to select macOS vs. Windows build.

## 4. Fix Desktop Dev Flow on Windows
- [x] 4.1 Make `dev:desktop:<shell>` runnable on Windows (avoid `lsof`, ensure ports/envs work, keep backend reuse best-effort).
- [x] 4.2 Verify desktop dev opens webview and proxies to backend/frontend as on macOS.

## 5. Validation
- [x] 5.1 Run `openspec validate add-desktop-windows-build --strict`.
- [x] 5.2 Dry-run desktop build on macOS and Windows hosts respectively (Windows run completed; macOS not available in this environment).
- [x] 5.3 Document any platform-specific prerequisites (Bun installed; backend/node_modules with sqlite3 bindings present; desktop/node_modules with webview-bun present; Windows build consumes webview.dll from webview-bun).
