## 0. Key Principle: No Backend Required
All tests use mock implementations to simulate backend API responses. The `HttpClient` interface enables dependency injection, allowing us to replace real HTTP calls with predetermined mock data.

## 1. Core API Tests (Mock HttpClient)
- [x] 1.1 Create `frontend/packages/core/test/PrepareDbDataTool.spec.ts`
- [x] 1.2 Implement `createMockHttpClient()` helper that:
  - Returns mock `ApiResponse<T>` data matching `@app/shared` structure
  - Routes requests by URL pattern and HTTP method
  - Supports both success (`{ code: 0, data: ... }`) and error (`{ code: 1, error: "..." }`) responses
- [x] 1.3 Define mock data fixtures:
  - `mockProfiles`: Sample `PrepareDbProfileDTO[]`
  - `mockColumns`: Sample `PrepareColumnInfo[]`
  - `mockTableProfiles`: Sample `PrepareTableProfileSummary[]` and `PrepareTableProfileDetail`
  - `mockTaskState`: Sample `PrepareTaskState`
- [x] 1.4 Add tests for profile CRUD operations (listProfiles, createProfile, updateProfile, deleteProfile, activateProfile, testConnection)
  - Verify correct URL construction (path params substitution)
  - Verify request body JSON serialization
  - Verify response unwrapping
- [x] 1.5 Add tests for schema operations (fetchSchema)
  - Verify POST body contains tableName, database, dbProfileId, tableProfileId
  - Verify nested response extraction (`data.columns`)
- [x] 1.6 Add tests for table profile operations (listTableProfiles, getTableProfile, saveTableProfile, applyTableProfile, deleteTableProfile)
  - Verify query param construction for listTableProfiles
  - Verify complex payload serialization for saveTableProfile
- [x] 1.7 Add tests for insert operations (previewInsert, executeInsert, cancelTask, getTask)
  - Verify taskId extraction from executeInsert
  - Verify path param substitution for cancelTask/getTask
- [x] 1.8 Add tests for error handling
  - Mock returns `{ code: 1, error: "Connection failed" }`
  - Verify `unwrap()` throws Error with correct message

## 2. Mediator Controller Tests (Mock PrepareDbDataApi)
- [x] 2.1 Create `frontend/packages/mediator/test/PrepareDbDataController.spec.ts`
- [x] 2.2 Implement mock `PrepareDbDataApi` object that:
  - Tracks method calls and arguments
  - Returns predetermined mock data
  - Allows verification of delegation behavior
- [x] 2.3 Add tests for listProfiles delegation
  - Verify api.listProfiles called with correct runtime
- [x] 2.4 Add tests for listTableProfiles delegation
  - Verify optional dbProfileId passed through
- [x] 2.5 Add tests for preview delegation
  - Verify payload passed to api.previewInsert unchanged
- [x] 2.6 Add tests for execute delegation
  - Verify taskId returned from api.executeInsert
- [x] 2.7 Add tests for subscribeProgress delegation
  - Verify onEvent callback passed to api.connectProgressSocket

## 3. Validation
- [x] 3.1 Run `bun run test` in core package to verify tests pass (no backend needed)
- [x] 3.2 Run `bun run test` in mediator package to verify tests pass (no backend needed)
