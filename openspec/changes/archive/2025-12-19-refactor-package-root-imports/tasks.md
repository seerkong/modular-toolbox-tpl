## 1. Implementation
- [x] 1.1 Choose alias names per package (backend core/mediator/elysia; frontend core/mediator/react/vue) that map to each package's `src/` root and avoid collisions with existing workspace aliases.
- [x] 1.2 Update tooling configs (tsconfig/bun/Vite) so the aliases resolve in dev, build, and tests for backend and frontend packages.
- [x] 1.3 Migrate cross-module/shared infra/helper imports in backend packages to the new aliases (keep same-module relative imports intact).
- [x] 1.4 Migrate cross-module/shared infra/helper imports in frontend packages to the new aliases (keep same-module relative imports intact).
- [x] 1.5 Add contributor docs describing the alias convention and when to use it vs relative imports.

## 2. Validation
- [x] 2.1 Run `openspec validate refactor-package-root-imports --strict`.
- [x] 2.2 Run backend builds/tests (e.g., `bun run build:backend`, `bun run test:backend`) to confirm alias resolution. (`bun run test:backend` currently fails in core SQL builder test: expected insert rows differ.)
- [x] 2.3 Run frontend builds for both shells (`bun run build:frontend:vue`, `bun run build:frontend:react`) to confirm alias resolution.
