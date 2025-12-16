# Change: Add unit tests for PrepareDbDataTool frontend core and mediator modules

## Why
The PrepareDbDataTool module in `frontend/packages/core` and `frontend/packages/mediator` lacks unit test coverage. Following the layered modular architecture, core and mediator layers are designed to be UI-framework-agnostic and testable independently. Adding tests ensures the API implementation and controller logic work correctly without requiring Vue or React integration.

**Key Architecture Benefit**: The layered design with `HttpClient` interface injection enables complete backend-independent testing. Tests can simulate API responses through mock implementations, verifying frontend logic without running any backend service.

## What Changes
- Add unit tests for `PrepareDbDataApiImpl` in `frontend/packages/core/test/`
  - Use mock `HttpClient` to simulate backend API responses
  - Verify HTTP request construction (URL, method, headers, body)
  - Verify response unwrapping and error handling
- Add unit tests for `PrepareDbDataController` in `frontend/packages/mediator/test/`
  - Use mock `PrepareDbDataApi` to verify delegation logic
  - Verify controller correctly passes runtime and payloads to API layer

**No backend required**: All tests run with mock data, simulating realistic `ApiResponse<T>` structures (`{ code: 0, data: ... }` for success, `{ code: 1, error: "..." }` for errors).

## Impact
- Affected specs: `prepare-db-data-tool`
- Affected code:
  - `frontend/packages/core/test/PrepareDbDataTool.spec.ts` (new)
  - `frontend/packages/mediator/test/PrepareDbDataController.spec.ts` (new)
