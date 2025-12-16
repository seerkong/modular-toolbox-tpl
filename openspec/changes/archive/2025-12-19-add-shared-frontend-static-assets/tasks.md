## 1. Implementation
- [x] 1.1 Create `frontend/static/` as the shared source for shell assets and relocate the CRT files there while keeping relative paths consistent.
- [x] 1.2 Add automation (script or Vite plugin) that syncs `frontend/static/` into `frontend/packages/vue/public/` and `frontend/packages/react/public/` for both dev server startup and build.
- [x] 1.3 Wire shell dev/build scripts so the sync runs automatically for `bun run dev:vue`, `bun run dev:react`, `bun run build:vue`, and `bun run build:react`, including top-level wrappers.
- [x] 1.4 Document the new static-asset workflow for frontend contributors.

## 2. Validation
- [x] 2.1 Run `openspec validate add-shared-frontend-static-assets --strict`.
- [x] 2.2 Run one dev session per shell and confirm CRT images load from `/crt/*` without manual copies (ensures sync during dev).
- [x] 2.3 Run `bun run build:vue` and `bun run build:react` and confirm build outputs contain the shared assets with the expected paths.
