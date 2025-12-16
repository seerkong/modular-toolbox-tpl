## ADDED Requirements
### Requirement: Backend package-root import aliases
Backend packages SHALL provide aliases from each package `src/` root (e.g., `@backend/mediator/*`, `@backend/core/*`, `@backend/elysia-shell/*`) so shared infra/helpers can be imported without deep relative paths, while keeping same-module relative imports optional.

#### Scenario: Import backend infra without deep relatives
- **WHEN** a mediator endpoint or service imports shared infra (e.g., logging, http contracts) from outside its module
- **THEN** the import uses the package-root alias (e.g., `@backend/mediator/infra/logging`) instead of relative paths like `../../../../infra/logging`, and bun/tsconfig resolution works in build and test.
