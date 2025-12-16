## ADDED Requirements
### Requirement: Backend bootstrap config for module sqlite
Backend SHALL accept a bootstrap configuration that provides a `dataDir` and per-module sqlite filename settings, store it on BackendRuntime, and use shared mediator infra to ensure sqlite datasources for module storage, while elysia composes the concrete data paths.

#### Scenario: Start server with configured data dir
- **WHEN** the server reads `AppConstConfig.dataDir` or an `APP_DATA_DIR` override
- **THEN** BackendRuntime receives that `dataDir` in its bootstrap config, module sqlite files resolve under that directory via shared ensure logic, and mediator code stays transport-agnostic.
