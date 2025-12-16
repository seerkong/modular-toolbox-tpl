## 1. Implementation
- [x] 1.1 Add shared + backend/frontend core contracts/runtime for `PrepareDbDataTool` (API enums, DTOs, mock option defaults, schema/profile/connection types).
- [x] 1.2 Implement backend mediator services/datasource/endpoints for DB profile CRUD/activation/test, schema fetch/classification, profile save/reuse, and preview/execute with streaming progress; wire into `createBackendRuntime` and Elysia adapters.
- [x] 1.3 Implement frontend core state/helpers/APIs plus mediator DI/controller for `PrepareDbDataTool`, exposing shell-ready clients (WebSocket progress).
- [x] 1.4 Build Vue module (routes/views/components) matching list-first UX for DB profiles, schema management, and insert preview/execute with WebSocket progress; register routes/menus.
- [x] 1.5 Build React module (routes/views/components/hooks) matching the same flows and WebSocket progress; register routes/menus.
- [x] 1.6 Validation: run `openspec validate add-prepare-db-data-tool --strict`, `bun run build:backend`, `bun run build:frontend:vue`, and `bun run build:frontend:react` (or equivalent) to ensure typings/exports align.
