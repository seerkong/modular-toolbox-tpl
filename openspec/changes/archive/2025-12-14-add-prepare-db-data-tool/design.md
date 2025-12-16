## Context
- We need to add a DB data preparation tool into this repo using the layered module patterns from `docs/ai-guide/` (shared → backend/frontend core → mediator → shells).
- The source tool covers MySQL profile CRUD/activation/test, table schema classification + mock profile reuse, and batch insert preview/execute with streaming progress/logs (originally via WebSocket).
- The new module should be named `PrepareDbDataTool` and coexist with existing modules without breaking router/theme or backend adapter conventions.

## Goals / Non-Goals
- Goals: replicate the core logic and user flows (list-first DB profile UX, schema + field mock configuration with reuse, insert preview/execute with streaming progress and cancellation) using this repo’s modular structure; keep API shapes driven by shared contracts.
- Non-Goals: add new database engines or mock strategies beyond the source set; implement React shell UI in this change; introduce generic task orchestration outside this module.

## Decisions
- Module mapping: create `PrepareDbDataTool` folders across shared, backend core/mediator, frontend core/mediator, and both Vue/React shell modules; register routes via data-driven router resources and endpoints via `createBackendRuntime`.
- Persistence & connectivity: store DB/table/mock profiles in a module-scoped SQLite file under the existing data dir (via TypeORM) and connect to target MySQL databases via `mysql2` pools; keep core pure (no ORM) with contracts + logic helpers for mock generation and schema classification.
- Streaming transport: use WebSocket for progress/log updates end-to-end (aligning with the source tool), emitting structured status/log/progress events per task that both shells consume; keep debug panel semantics (sticky summary, auto-appended logs with caps).
- API surface: expose REST endpoints + WebSocket progress keyed by shared API enums; honor readiness gating (disable preview/execute until active profile + completed table profile + schema present) and reuse field configs only when column names/types match.
- UI flow: preserve list-first layouts (profiles above forms) and “pull schema → configure fields → save/apply profile” flow; keep theme tokens and layout compatible with the current Vue shell styling while providing React parity.

## Risks / Trade-offs
- SSE vs WebSocket: SSE fits current shell adapters but may differ from original buffering; need to batch or cap log events to avoid DOM churn.
- Large insert workloads could stress MySQL or the SQLite metadata store; we should keep batch sizes bounded and surface clear errors/status.
- MySQL connectivity variance (missing DB names, network failures) must be propagated as user-facing errors without crashing the shell.

## Migration Plan
- Define shared contracts/constants (API paths, DTOs for profiles/schema/mock configs, progress events, mock option enums/defaults).
- Add backend core services/helpers for schema classification + mock generation; implement mediator datasource/service + endpoint handlers; register handler maps in `createBackendRuntime` and ensure SSE progress channel.
- Add frontend core state/runtime/api helpers; wire mediator DI/controller bindings; build Vue module routes/views to mirror the source UX; register router resources/menus.
- Validate with `openspec validate add-prepare-db-data-tool --strict` and backend/frontend build scripts.

## Open Questions
- Should we also ship a React shell module now or defer until requested?
  答：yes
- Keep WS compatibility for the debug panel, or is SSE-only acceptable for desktops that embed the shell?
  答：使用websocket, 不使用sse
- Any constraints on the data directory/file naming for the new SQLite store beyond the existing `AppConstConfig` defaults?
  答：sqlite文件，在shared模块中，新增的这个模块中，也新建ConstConfig.ts， 然后配置sqlite文件名为PrepareDbDataTool.sqlite
