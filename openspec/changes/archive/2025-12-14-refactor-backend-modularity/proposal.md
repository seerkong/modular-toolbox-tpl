# Change: Refactor backend into core/mediator/elysia modular packages

## Why
- Current backend is a single package, making it hard to swap frameworks or reuse business logic across server shells.
- Frontend already adopted a core → mediator → shell modular pattern; backend should mirror it to align architecture and developer workflows.
- We need AI-facing guides to onboard future backend modules consistently.

## What Changes
- Introduce backend packages `@backend/core`, `@backend/mediator`, and `@backend/elysia-shell` with clear dependency boundaries (core is framework-agnostic; mediator handles DI/ORM; elysia handles transport/server wiring).
- Define per-module folder conventions (Example) for contracts, runtime helpers, services, endpoints, and datasources.
- Add AI guide docs for adding backend modules at each layer and summarize cross-area modular architecture principles (frontend, backend, shared).

## Impact
- Affected specs: backend-modularity
- Affected code: backend package structure, build/runtime wiring, docs/ai-guide additions
