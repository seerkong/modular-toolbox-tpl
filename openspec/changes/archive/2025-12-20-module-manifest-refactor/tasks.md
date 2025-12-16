## 1. Backend Infrastructure

- [x] 1.1 Define `BackendRuntime`, `BackendActorMesh`, `BackendConfig` types in `@backend/mediator/infra/types`
- [x] 1.2 Define `BackendModuleManifest` interface with `createActorMesh` and `createEndpoints`
- [x] 1.3 Define `ModuleEndpoints` interface for endpoint type grouping
- [x] 1.4 Implement `BackendModuleRegistry` for module registration and runtime building

## 2. Frontend Infrastructure

- [x] 2.1 Define `FrontendRuntime`, `FrontendActorMesh`, `FrontendConfig` types in `@frontend/mediator/types`
- [x] 2.2 Define `FrontendModuleManifest` interface with `createActorMesh` and routes
- [x] 2.3 Implement `FrontendModuleRegistry` for module registration

## 3. Module Migration

- [x] 3.1 Create `Example` module manifest (backend)
- [x] 3.2 Create `PrepareDbDataTool` module manifest (backend)
- [x] 3.3 Create `Example` module manifest (frontend)
- [x] 3.4 Create `PrepareDbDataTool` module manifest (frontend)

## 4. Runtime Type Definitions

- [x] 4.1 Add `contract/Runtime.ts` to `@backend/core/modules/Example`
- [x] 4.2 Add `contract/Runtime.ts` to `@backend/core/modules/PrepareDbDataTool`
- [x] 4.3 Add `contract/Runtime.ts` to `@frontend/core/modules/Example`
- [x] 4.4 Add `contract/Runtime.ts` to `@frontend/core/modules/PrepareDbDataTool`

## 5. Integration

- [x] 5.1 Create `modules/index.ts` with unified module exports (backend)
- [x] 5.2 Create `modules/index.ts` with unified module exports (frontend)
- [x] 5.3 Update mediator entry points to use registry pattern
