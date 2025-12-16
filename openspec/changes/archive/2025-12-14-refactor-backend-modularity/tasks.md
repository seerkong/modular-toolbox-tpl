## 1. Prepare
- [x] 1.1 Review current backend monolith (entities, endpoints, data-source) and docs/ai-guide patterns used for frontend modularity.
- [x] 1.2 Define workspace/package layout for bun-based backend packages and agree on package names and entry points.

## 2. Core package (@backend/core)
- [x] 2.1 Extract framework-agnostic contracts, entities, runtime types, and helpers into `backend/packages/core` with module folders (Example).
- [x] 2.2 Ensure core exports no framework/DI/ORM dependencies and exposes needed interfaces for services/runtime.

## 3. Mediator package (@backend/mediator)
- [x] 3.1 Scaffold mediator with DI/runtime composition and service implementations that satisfy core interfaces.
- [x] 3.2 Create per-module datasources (sqlite paths), service implementations, and endpoint adapters (no server framework imports).

## 4. Elysia package (@backend/elysia-shell)
- [x] 4.1 Wire elysia server to mediator endpoints; map POST JSON/form-data/SSE/WebSocket to handlers with proper header/cors handling.
- [x] 4.2 Update backend entry to bootstrap from elysia package and reuse shared contracts.

## 5. Docs and validation
- [x] 5.1 Add AI guides: HowAddModuleToBackendCore.md, HowAddModuleToBackendMediator.md, HowAddModuleToBackendElysia.md, and ArchitecturalDesignPrinciplesAndPractices.md.
- [x] 5.2 Add basic build/run/test verification for new package layout (bun build/run) and update any scripts if needed.
- [x] 5.3 Run openspec validate --strict and smoke-check backend upload/execute endpoints under new wiring.
