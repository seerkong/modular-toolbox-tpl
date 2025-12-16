# Change: Add PrepareDbDataTool module

## Why
- The user asked to add a DB data preparation tool (database profile management, schema-driven mock configuration, and batch insert flows) into this repository while following our modular guides.
- We need a scoped plan before implementation to align backend/frontend layers and keep the new tool consistent with `docs/ai-guide/` and existing OpenSpec conventions.

## What Changes
- Introduce a `PrepareDbDataTool` module across shared/core/mediator layers to cover MySQL profile CRUD/activation, schema classification, mock profile reuse, and batch insert generation with streaming progress.
- Add Vue-shell module(s) with the list-first interaction flows (DB profiles, schema/profile editor, insert preview/execute) wired through the data-driven router and existing theme/layout.
- Wire backend endpoints into the Elysia shell and register frontend DI/routes so the new module can be used alongside existing modules.

## Impact
- Affected specs: prepare-db-data-tool (new)
- Affected code: shared contracts/constants, backend core/mediator/elysia, frontend core/mediator/vue modules, router/menu resources
