## Context
PrepareDbDataTool's sqlite datasource creation is currently embedded inside its module datasource, and data path composition lives in mediator. This makes reuse by future modules harder and ties mediator to shared path rules.

## Goals / Non-Goals
- Goals: centralize sqlite ensure logic, provide explicit bootstrap config, keep mediator transport-agnostic, enable isolated tests.
- Non-Goals: change runtime behavior of PrepareDbDataTool or module APIs.

## Decisions
- Decision: add BackendBootstrapConfig with `dataDir` and per-module sqlite filenames; BackendRuntime stores this config for module services.
- Decision: move data path composition into elysia layer to own shared/module path assembly.
- Decision: use mediator infra helper for sqlite ensure/creation to avoid module-specific copies.

## Risks / Trade-offs
- Risk: mis-wiring config could change db locations. Mitigation: tests will pin expected output paths under testdata.

## Migration Plan
- Move ensure logic and rewire module datasource to use new infra helper.
- Introduce bootstrap config and pass from server startup.
- Relocate path composition into elysia and update mediator callers.
- Add tests to validate behavior.

## Open Questions
- None.
