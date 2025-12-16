## ADDED Requirements
### Requirement: Shared static assets for frontend shells
Shared static assets SHALL live in `frontend/static/` and be automatically mirrored into each shell's `public/` directory for development and build outputs, eliminating per-shell duplication.

#### Scenario: Sync static assets for dev servers
- **WHEN** a developer starts `bun run dev:vue` or `bun run dev:react` (directly or via the root scripts)
- **THEN** the contents of `frontend/static/` are copied into `frontend/packages/<shell>/public/` before Vite serves files, preserving relative paths such as `/crt/<file>`, so no manual copy is needed per shell.

#### Scenario: Include shared assets in shell builds
- **WHEN** `bun run build:vue` or `bun run build:react` runs (including through root build commands)
- **THEN** the static assets from `frontend/static/` are present in each shell's `public/` for the build and appear in the final build output with the same URLs (e.g., `/crt/<file>`).
