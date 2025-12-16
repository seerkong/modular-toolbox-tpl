# backend-modularity Specification

## Purpose
TBD - created by archiving change refactor-backend-modularity. Update Purpose after archive.
## Requirements
### Requirement: Backend layered packages
Backend SHALL provide three bun packages: `@backend/core` (framework-agnostic business contracts/helpers), `@backend/mediator` (DI + ORM-backed service implementations without transport deps), and transport shells that depend on mediator but not vice versa (`@backend/elysia-shell` and `@backend/koa-shell`).

#### Scenario: Package boundaries enforced
- **WHEN** building or adding backend modules
- **THEN** core exports contain no DI/ORM/server imports, mediator uses DI/ORM but no Elysia/Koa imports, and Elysia/Koa shells only call mediator/public contracts.

### Requirement: Backend module layout conventions
Each backend package SHALL organize modules (e.g., Example) with `index.ts` plus `contract/`, `entity/`, `runtime/`, `logic/`, and `helper/` folders; `runtime/` holds runtime shapes/defaults only, while business builders/normalizers live in `logic/`. Mediator modules additionally include `datasource/`, `service/`, and transport-specific `endpoint/` subfolders split by type (`GetJson/`, `PostJson/`, `PostFormData/`, `SSE/`, `Websocket/`) with one endpoint per file, allowing module-specific sqlite datasources.

#### Scenario: New module scaffold
- **WHEN** scaffolding a new backend module
- **THEN** its core folder keeps runtime helpers separate from logic, its mediator folder implements services/datasources and groups one endpoint per file under typed subfolders, and its elysia layer maps GET/POST/FormData/SSE/WebSocket routes to the corresponding mediator handler maps without importing DI/ORM.

### Requirement: Backend AI guides
Documentation SHALL be added under `docs/ai-guide/` describing how to add modules to backend core, mediator, and elysia packages, plus an architecture principles doc covering modular design across frontend, backend, and shared; guides MUST spell out runtime vs logic placement and per-endpoint file layout by transport type.

#### Scenario: AI-assisted onboarding
- **WHEN** an AI assistant needs to add or modify a backend module
- **THEN** it can follow `HowAddModuleToBackendCore.md`, `HowAddModuleToBackendMediator.md`, `HowAddModuleToBackendElysia.md`, and `ArchitecturalDesignPrinciplesAndPractices.md` to produce changes consistent with the layered architecture, including runtime/logic separation and single-file typed endpoint folders.

### Requirement: Backend bootstrap config for module sqlite
Backend SHALL accept a bootstrap configuration that provides a `dataDir` and per-module sqlite filename settings, store it on BackendRuntime, and use shared mediator infra to ensure sqlite datasources for module storage, while elysia composes the concrete data paths.

#### Scenario: Start server with configured data dir
- **WHEN** the server reads `AppConstConfig.dataDir` or an `APP_DATA_DIR` override
- **THEN** BackendRuntime receives that `dataDir` in its bootstrap config, module sqlite files resolve under that directory via shared ensure logic, and mediator code stays transport-agnostic.

### Requirement: Backend package-root import aliases
Backend packages SHALL provide aliases from each package `src/` root (e.g., `@backend/mediator/*`, `@backend/core/*`, `@backend/elysia-shell/*`, `@backend/koa-shell/*`) so shared infra/helpers can be imported without deep relative paths, while keeping same-module relative imports optional.

#### Scenario: Import backend infra without deep relatives
- **WHEN** a mediator endpoint or service imports shared infra (e.g., logging, http contracts) from outside its module
- **THEN** the import uses the package-root alias (e.g., `@backend/mediator/infra/logging`) instead of relative paths like `../../../../infra/logging`, and bun/tsconfig resolution works in build and test.

### Requirement: Backend module manifest pattern
Each backend module SHALL define a `manifest.ts` that exports a `BackendModuleManifest` object with `name`, `createActorMesh(runtime)`, and `createEndpoints(runtime)` methods; the manifest receives the full `BackendRuntime` (config + actorMesh) and returns the module's ActorMesh and endpoints respectively.

#### Scenario: Define module manifest
- **WHEN** creating a new backend module
- **THEN** the module exports a manifest with `createActorMesh` returning the module's services and `createEndpoints` returning endpoint handlers grouped by type (getJson, post, put, delete, formData, sse, ws).

#### Scenario: Access runtime dependencies
- **WHEN** a module's `createActorMesh` or `createEndpoints` executes
- **THEN** it can access `runtime.config.modules[ModuleName]` for module-specific config and `runtime.actorMesh.infra` for shared infrastructure services.

### Requirement: Backend module registry
Backend mediator SHALL provide a `BackendModuleRegistry` that accepts module manifests, builds the complete `BackendRuntime` by invoking each manifest's `createActorMesh` and `createEndpoints`, and returns a ready-to-use runtime object.

#### Scenario: Register and build runtime
- **WHEN** the application starts
- **THEN** it registers all module manifests with the registry, calls `registry.build(config)`, and receives a `BackendRuntime` with all modules' actorMesh and endpoints populated.

#### Scenario: Single-point module registration
- **WHEN** adding a new module to the backend
- **THEN** only one file (`modules/index.ts`) needs modification—adding one import and one array entry.

### Requirement: Module runtime type definitions
Each module SHALL define its Runtime type subset in `@backend/core/modules/{ModuleName}/contract/Runtime.ts`, including `{ModuleName}ActorMesh`, `{ModuleName}ModuleConfig`, and `{ModuleName}ModuleRuntime` interfaces; the framework passes the full `BackendRuntime` (a superset), ensuring type compatibility.

#### Scenario: Type-safe module dependencies
- **WHEN** a module declares its `ModuleRuntime` interface
- **THEN** TypeScript enforces that the module only accesses declared dependencies while the framework provides the full runtime.

### Requirement: Frontend module manifest pattern
Each frontend module SHALL define a `manifest.ts` that exports a `FrontendModuleManifest` object with `name`, `routes`, and `createActorMesh(runtime)` method; the manifest receives the `FrontendRuntime` and returns the module's ActorMesh (typically containing API implementations).

#### Scenario: Define frontend module manifest
- **WHEN** creating a new frontend module
- **THEN** the module exports a manifest with `routes` for navigation and `createActorMesh` returning API clients or other module services.

### Requirement: Frontend module registry
Frontend mediator SHALL provide a `FrontendModuleRegistry` that accepts module manifests, builds the complete `FrontendRuntime` with routeTable and actorMesh, and provides the runtime to UI frameworks via context (React) or provide/inject (Vue).

#### Scenario: Frontend runtime access
- **WHEN** a component needs to access module APIs
- **THEN** it uses framework-specific hooks (`useRuntime()` in React, `inject('runtime')` in Vue) to get the `FrontendRuntime` and access `runtime.actorMesh.modules[ModuleName]`.

### Requirement: Koa shell parity with Elysia
The Koa backend shell SHALL run on Node.js and mirror Elysia behavior for routing, status defaults, logging, CORS headers, `/api/meta`, static file hosting, SSE, and WebSocket endpoints, using the same mediator handlers and `HandlerContext` mapping.

#### Scenario: Elysia and Koa return consistent responses
- **WHEN** the same mediator endpoint is invoked via Elysia and Koa
- **THEN** both shells return equivalent status codes, `ApiResponse` payloads, CORS headers, and log formats.

### Requirement: Koa shell build and install scripts
The repository SHALL provide root-level scripts to develop and build the Koa backend shell and to install Node.js runtime dependencies, including `dev:backend:koa`, `build:backend:koa`, `build:web:vue-koa`, `build:web:react-koa`, and `install:all:nodejs`.

#### Scenario: Build and install with Node.js runtime
- **WHEN** running the Node.js setup and build scripts from the repo root
- **THEN** Koa backend builds succeed and web builds can be produced without requiring desktop-specific build variants.

