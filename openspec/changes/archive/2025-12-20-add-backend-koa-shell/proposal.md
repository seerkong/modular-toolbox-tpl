# Change: Add Koa backend shell with Elysia parity (Node.js runtime)

## Why
The backend architecture is already layered and framework-agnostic at core/mediator, but only Elysia is supported today. Adding a Koa shell with identical behavior proves the architecture’s framework independence and enables teams to pick the transport framework without changing business logic.

## What Changes
- Add a new `@backend/koa-shell` package that wires `@backend/mediator` to Koa with behavior fully aligned to the Elysia shell (CORS, logging, status mapping, `/api/meta`, static hosting, SSE, WS).
- Add Koa dev/build scripts in `backend/package.json` and root `package.json`, plus web build shortcuts (`build:web:vue-koa`, `build:web:react-koa`).
- Add `install:all:nodejs` at the repo root to install Node.js-runtime dependencies.
- Update backend AI docs to describe the Koa shell, runtime constraints, and build commands.

## Impact
- Affected specs: `backend-modularity`.
- Affected code: `backend/packages/koa`, `backend/package.json`, root `package.json`, `scripts/` (new install script), `docs/ai/` backend guidance.
