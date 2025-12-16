# Project Context

## Purpose
- Modular toolbox template built on the Core-Mediator-Shell (plus Shared) architecture, supporting both Web and Desktop shells so new modules can be added quickly.
- Includes sample modules such as PrepareDbDataTool to demonstrate database prep, schema management, and mock data execution scenarios.

## Tech Stack
- TypeScript across Bun/PNPM workspaces; shared contracts live in `@app/shared`.
- Backend: Bun + Elysia shell and Node.js + Koa shell; Mediator uses TypeORM with sqlite3/mysql2; Core holds business logic.
- Frontend: Vite build; Vue 3 shell and React 18 shell; Mediator/Controller uses Inversify + `@vue/reactivity`; routing via vue-router or react-router-dom.
- Desktop: Bun + `webview-bun` to load the web build for a desktop package.

## Project Conventions

### Code Style
- TypeScript ESM. Import order -> external libs -> `@backend/*`/`@frontend/*`/`@app/shared` -> relative paths (RULE-GEN-002). Module names PascalCase; API paths kebab-case (RULE-GEN-001).
- Frontend: avoid `alert/confirm/prompt` (RULE-FE-001); keep theming via CSS classes/variables; React subscribes via `useReactiveValue` (RULE-FE-003).
- Backend: entities live in core/entity without module prefixes (RULE-BE-001/004); datasource paths are injected from shell config, not read directly from env (RULE-BE-005).
- Shared only defines DTOs/Api enums/constants with no framework imports; dependency direction stays Shell <- Mediator <- Core <- Shared (RULE-ARCH-001/003).

### Architecture Patterns
- Four-layer flow: Shell (transport/UI) <- Mediator (DI/tech) <- Core (business pure functions + contracts) <- Shared (cross-layer contracts).
- Frontend Mediator assembles controller + router + manifest; shells reuse routes and actorMesh; all API paths must come from shared enums.
- Module manifests (e.g., PrepareDbDataTool) are aggregated in mediator then consumed by shells; keep Vue/React implementations in sync when adding UI.

### Testing Strategy
- Backend: `bun run test:backend` for core + mediator; shells validated via dev/build runs.
- Frontend: Vitest for core/mediator (`bun run test:frontend` or per-package tests); UI shells validated via `bun run dev:frontend:<vue|react>` and build.
- Prioritize contract/pure-function tests to avoid coupling to transport frameworks.

### Git Workflow
- Use feature branches + PR review; branch names like `feature/<topic>` or `fix/<topic>`.
- Commits follow Conventional Commits (`feat`/`fix`/`chore`/`docs`/`test`, etc.) to keep history and automation clean.

## Domain Context
- PrepareDbDataTool lets users configure MySQL connections, read table schemas, attach mock generators per column, run batch inserts, and stream progress via WebSocket.
- Layering: shared <- backend core/mediator <- frontend core/mediator <- vue/react shells, clarifying where to add business logic by layer.

## Important Constraints
- Dependency direction is strict: Shell <- Mediator <- Core <- Shared; reverse imports are disallowed.
- Frontend theming uses CSS variables/classes; no inline colors and no alert/confirm/prompt; component routes are mapped in mediator, shells only resolve.
- Backend TypeORM table names have no module prefixes; paths/config come from shell; core/shell must not import ORM/DI at runtime.

## External Dependencies
- DB/ORM: TypeORM, sqlite3, mysql2.
- Backend transport: Elysia (Bun), Koa (Node.js).
- Frontend: Vue 3 + vue-router, React 18 + react-router-dom, Inversify, `@vue/reactivity`.
- Build/tools: Vite, Bun, Vitest/Bun test, concurrently.
- Desktop: `webview-bun` for loading the UI bundle.
