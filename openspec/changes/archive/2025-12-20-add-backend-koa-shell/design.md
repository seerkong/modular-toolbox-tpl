## Context
Backend modules already follow a layered architecture with a framework-agnostic core and mediator. The only transport shell is Elysia (Bun runtime). The goal is to add a Koa shell that runs on Node.js while preserving identical runtime behavior so the backend is as framework-agnostic as the frontend.

## Goals / Non-Goals
- Goals:
  - Provide a `@backend/koa-shell` package that mirrors Elysia shell behavior across routing, status mapping, logging, CORS, `/api/meta`, static hosting, SSE, and WS.
  - Keep all business logic in `@backend/mediator` so Elysia and Koa consume identical handlers.
  - Provide Node.js-friendly dev/build scripts and a root `install:all:nodejs` installer.
- Non-Goals:
  - Rewriting mediator or core contracts.
  - Introducing new API shapes or endpoint types beyond those already supported.

## Decisions
- Koa shell runtime: Node.js. The new package will target Node.js for runtime but remain installable via the repo’s existing package manager (Bun). Dev/build scripts will use Node-compatible tooling.
- Dependencies: use `koa`, `koa-router`, `koa-bodyparser`, `koa-static` for HTTP, `koa-websocket` for WS. SSE will use raw `ctx.res.write` with explicit headers, matching the Elysia behavior.
- Parity strategy: replicate the Elysia adapter semantics by mapping Koa `ctx` into the existing `HandlerContext` (`body`, `query`, `params`, `request`, `setHeader`, `error`, `log`) and by keeping the same status defaulting logic (`code == 0` -> 200, else 400) and log format.
- Static assets and meta endpoint: keep `/api/meta` and static serving rules identical to Elysia (skip `/api` paths, serve `frontendDir` when configured).

## Risks / Trade-offs
- WS/SSE behavior can vary across frameworks; to keep parity, we must explicitly align headers, logging, and lifecycle handling (close/error) between Koa and Elysia.
- Node.js tooling adds another build mode. A dedicated install script will reduce confusion when the runtime is Node.js but the repo otherwise uses Bun.

## Migration Plan
1. Add Koa shell package and scripts.
2. Update docs/ai to include Koa shell and build instructions.
3. Provide smoke validation commands for both Elysia and Koa shells.

## Open Questions
- None.
