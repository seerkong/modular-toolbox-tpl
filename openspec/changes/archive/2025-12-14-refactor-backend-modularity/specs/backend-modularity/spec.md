## ADDED Requirements

### Requirement: Backend layered packages
Backend SHALL provide three bun packages: `@backend/core` (framework-agnostic business contracts/helpers), `@backend/mediator` (DI + ORM-backed service implementations without transport deps), and `@backend/elysia-shell` (transport/server wiring that depends on mediator but not vice versa).

#### Scenario: Package boundaries enforced
- **WHEN** building or adding backend modules
- **THEN** core exports contain no DI/ORM/server imports, mediator uses DI/ORM but no Elysia imports, and elysia code only calls mediator/public contracts.

### Requirement: Backend module layout conventions
Each backend package SHALL organize modules (e.g., Example) with `index.ts` plus `contract/`, `entity/`, `runtime/`, `logic/`, and `helper/` folders; `runtime/` holds runtime shapes/defaults only, while business builders/normalizers live in `logic/`. Mediator modules additionally include `datasource/`, `service/`, and transport-specific `endpoint/` subfolders split by type (`GetJson/`, `PostJson/`, `PostFormData/`, `SSE/`, `Websocket/`), with one endpoint per file and module-specific sqlite datasources allowed.

#### Scenario: New module scaffold
- **WHEN** scaffolding a new backend module
- **THEN** its core folder keeps runtime helpers separate from logic, its mediator folder implements services/datasources and groups one endpoint per file under typed subfolders, and its elysia layer maps GET/POST/FormData/SSE/WebSocket routes to the corresponding mediator handler maps without importing DI/ORM.

### Requirement: Backend AI guides
Documentation SHALL be added under `docs/ai-guide/` describing how to add modules to backend core, mediator, and elysia packages, plus an architecture principles doc covering modular design across frontend, backend, and shared; guides MUST spell out runtime vs logic placement and per-endpoint file layout by transport type.

#### Scenario: AI-assisted onboarding
- **WHEN** an AI assistant needs to add or modify a backend module
- **THEN** it can follow `HowAddModuleToBackendCore.md`, `HowAddModuleToBackendMediator.md`, `HowAddModuleToBackendElysia.md`, and `ArchitecturalDesignPrinciplesAndPractices.md` to produce changes consistent with the layered architecture, including runtime/logic separation and single-file typed endpoint folders.
