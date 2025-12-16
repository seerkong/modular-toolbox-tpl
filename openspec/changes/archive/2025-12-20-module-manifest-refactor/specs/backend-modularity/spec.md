## ADDED Requirements

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
