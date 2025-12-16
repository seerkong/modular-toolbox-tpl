## Context
The frontend follows a layered modular architecture:
- **Core**: Contains contracts (interfaces), API implementations, runtime definitions, state, and helpers. UI- and DI-free.
- **Mediator**: Contains controllers (orchestration) and DI container bindings. Framework-neutral.
- **Shell (Vue/React)**: UI components that use mediator controllers.

The PrepareDbDataTool module provides database data preparation functionality with:
- Database profile management (CRUD + connection testing)
- Schema introspection
- Table profile management (save/apply field configurations)
- Data generation preview and execution with progress tracking

**Key Architecture Benefit**: The layered design allows core and mediator to be tested independently without Vue/React dependencies. By injecting a mock `HttpClient`, we can simulate backend API responses and verify the frontend logic works correctly without running any backend service.

## Goals
- Achieve test coverage for core API implementation logic
- Achieve test coverage for mediator controller orchestration
- **Tests MUST run without any backend API service** - all HTTP calls are mocked
- **Tests MUST simulate realistic API responses** to verify request/response handling
- Tests must run independently without Vue/React or real HTTP calls
- Follow existing test patterns from `mediator/test/task-controller.spec.ts`

## Non-Goals
- Testing Vue/React UI components (shell layer)
- Integration tests with real backend
- E2E testing

## Decisions

### Test Structure
- **Decision**: Create one spec file per layer (`core/test/PrepareDbDataTool.spec.ts`, `mediator/test/PrepareDbDataController.spec.ts`)
- **Rationale**: Matches existing patterns and keeps tests focused on their respective concerns

### Mock Strategy - No Backend Required
- **Decision**: Create a `MockHttpClient` that simulates backend API responses
- **Rationale**:
  - The `HttpClient` interface from core allows dependency injection
  - By implementing a mock that returns predefined `ApiResponse<T>` data, we can:
    1. Verify that `PrepareDbDataApiImpl` constructs correct HTTP requests (URL, method, headers, body)
    2. Verify that responses are correctly unwrapped and transformed
    3. Verify error handling when API returns error codes
  - No backend server needs to be running

### Mock Response Design
- **Decision**: Mock responses should mirror the actual `ApiResponse` structure from `@app/shared`
- **Structure**: `{ code: 0, data: <payload> }` for success, `{ code: 1, error: "message" }` for errors
- **Example mock data**:
  - Profile list: `[{ id: 1, name: "dev-db", host: "localhost", port: 3306, ... }]`
  - Schema columns: `[{ name: "id", rawType: "int", classification: "number", isPrimary: true }]`
  - Task state: `{ id: "task-123", status: "running", completed: 50, total: 100, ... }`

### WebSocket Testing
- **Decision**: Skip WebSocket connection tests in initial implementation
- **Rationale**: `connectProgressSocket` relies on browser WebSocket API which is harder to mock in Node.js jsdom environment. This can be added later with a WebSocket mock library.

## Test Coverage Focus

### Core API Tests
| Method | Test Focus |
|--------|------------|
| listProfiles | GET request construction, response unwrap |
| createProfile | POST with JSON body, response unwrap |
| updateProfile | PUT with path param, JSON body |
| deleteProfile | DELETE with path param |
| activateProfile | POST with path param |
| testConnection | POST with JSON body, error handling |
| fetchSchema | POST body construction, nested response extraction |
| listTableProfiles | GET with optional query param |
| getTableProfile | POST body, nullable response |
| saveTableProfile | POST with complex payload |
| applyTableProfile | POST with profileId + columns |
| deleteTableProfile | DELETE with path param |
| previewInsert | POST with generation input |
| executeInsert | POST returning taskId |
| cancelTask | POST with path param |
| getTask | GET returning nullable task state |

### Mediator Controller Tests
| Method | Test Focus |
|--------|------------|
| listProfiles | Delegates to api.listProfiles |
| listTableProfiles | Delegates to api.listTableProfiles with optional dbProfileId |
| preview | Delegates to api.previewInsert |
| execute | Delegates to api.executeInsert |
| subscribeProgress | Delegates to api.connectProgressSocket |

## Mock Implementation Pattern

### MockHttpClient Example
```typescript
const createMockHttpClient = (): HttpClient => {
  // Predefined mock data simulating backend responses
  const mockProfiles: PrepareDbProfileDTO[] = [
    { id: 1, name: "dev-db", host: "localhost", port: 3306, username: "root", database: "test", active: true },
  ];

  const mockColumns: PrepareColumnInfo[] = [
    { name: "id", rawType: "int", classification: "number", isPrimary: true },
    { name: "name", rawType: "varchar(255)", classification: "string", isPrimary: false },
  ];

  // Helper to wrap data in ApiResponse format
  const wrapSuccess = <T>(data: T): HttpResponse<ApiResponse<T>> => ({
    status: 200,
    ok: true,
    data: { code: 0, data },
  });

  const wrapError = (error: string): HttpResponse<ApiResponse<any>> => ({
    status: 400,
    ok: false,
    data: { code: 1, error },
  });

  return {
    async request(req) {
      // Route mock responses based on URL and method
      if (req.url === PrepareDbDataToolApi.ListDbProfiles && req.method === "GET") {
        return wrapSuccess(mockProfiles);
      }
      if (req.url === PrepareDbDataToolApi.FetchSchema && req.method === "POST") {
        return wrapSuccess({ columns: mockColumns });
      }
      // ... other routes
      return wrapError("Not found");
    },
  };
};
```

### Test Isolation Principle
Each test case should:
1. Create a fresh mock HttpClient with specific response data
2. Instantiate `PrepareDbDataApiImpl` (no DI container needed)
3. Create a runtime with the mock HttpClient
4. Call the API method and assert the result

This ensures:
- **No backend dependency**: Tests run purely in Node.js/jsdom
- **Deterministic results**: Mock data is predictable
- **Fast execution**: No network latency
- **Isolated failures**: Each test has its own mock state

## Risks / Trade-offs
- **Risk**: jsdom environment may not fully support all browser APIs
- **Mitigation**: Skip WebSocket tests; use vitest's jsdom environment which is already configured
- **Trade-off**: Not testing WebSocket logic reduces coverage but keeps tests simple and fast

## Open Questions
None - the implementation approach is straightforward based on existing patterns.
