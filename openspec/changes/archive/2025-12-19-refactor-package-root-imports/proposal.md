# Change: Add package-root import aliases for shared infra

## Why
- Deep relative imports to shared infra/helpers (e.g., `../../../../infra/http`) are brittle in nested modules and hurt readability.
- Both backend and frontend packages already have clear package boundaries; adding package-root aliases avoids path churn while keeping module-local imports simple.

## What Changes
- Define per-package root aliases (backend core/mediator/elysia; frontend core/mediator/vue/react) so shared infra/helpers can be imported from the package `src/` root without deep relatives.
- Wire bun/tsconfig and Vite resolver configs to honor these aliases consistently in dev, build, and tests.
- Migrate existing cross-module infra/helper imports to the new aliases while keeping same-module relative imports unchanged.
- Document the alias convention for backend and frontend contributors.

## Impact
- Affected specs: backend-modularity, frontend-shell
- Affected code: backend/frontend tsconfig/bun/vite configs; shared infra imports across backend mediator/endpoints and frontend shells/core/mediator docs
