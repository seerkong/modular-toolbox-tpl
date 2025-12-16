# Change: Refactor backend bootstrap + sqlite ensure for PrepareDbDataTool

## Why
The PrepareDbDataTool data source bootstrap logic is duplicated and tied to module internals, making new module sqlite setup harder to reuse and tests harder to isolate.

## What Changes
- Move sqlite ensure/creation logic into mediator infra for reuse across modules.
- Introduce a BackendBootstrapConfig that carries data dir + per-module sqlite filenames into BackendRuntime.
- Relocate data path composition from mediator to elysia to keep mediator transport-agnostic.
- Add tests for PrepareDbDataTool service and SQL preview generation.

## Impact
- Affected specs: backend-modularity
- Affected code: backend/packages/mediator, backend/packages/elysia, backend/packages/core
