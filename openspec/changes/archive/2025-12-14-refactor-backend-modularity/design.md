## Context
- Backend is currently a single bun package using Elysia + TypeORM + sqlite with endpoints and data-source in one place.
- Frontend was modularized into core → mediator → shell; backend should mirror that pattern to decouple business logic from transport and make module additions repeatable.
- AI guides exist for frontend and shared; backend lacks equivalent guidance.

## Goals
- Create three backend packages: core (framework-agnostic), mediator (DI/service impl, data access), elysia (transport/server wiring).
- Define per-module folder conventions (Example) consistent with frontend naming.
- Add AI guide docs for adding modules at each layer and summarize architecture principles.

## Non-Goals
- Changing business behavior of existing endpoints beyond mechanical wiring.
- Introducing new database engines or transport frameworks beyond Elysia.
- Adding complex build pipelines; keep bun-based workspaces minimal.

## Decisions
- **Packages & names:** Use `@backend/core`, `@backend/mediator`, `@backend/elysia-shell` under `backend/packages/*`, aligned with existing bun workspace tooling.
- **Dependency boundaries:** Core exposes contracts/entities/helpers only; no DI/ORM/server imports. Mediator may use DI and ORM (TypeORM) but not Elysia. Elysia depends on mediator to expose HTTP/SSE/WebSocket handlers.
- **Module layout:** Each package groups modules (Example) with `index.ts`, `contract/`, `entity/`, `runtime/`, `helper/`; mediator adds `datasource/`, `service/`, `endpoint/` (split by transport type).
- **Datasources:** Allow module-specific sqlite files via datasources under mediator, keeping configuration per module.
- **Docs:** Add AI guides for core/mediator/elysia module creation plus an architecture principles doc spanning frontend/backend/shared modular patterns.

## Risks / Mitigations
- **Migration churn:** Clear tasks and module-level extraction order (core → mediator → elysia) reduces regressions; keep behavior parity.
- **Boundary leaks:** Enforce no framework imports in core; add lint/checklist in tasks and review.
- **Build tooling:** Use bun workspaces; avoid pnpm to match project direction.

## Open Questions
- Do we need a shared config helper for module-specific sqlite paths (e.g., per-module data dir)? Will clarify during implementation.
