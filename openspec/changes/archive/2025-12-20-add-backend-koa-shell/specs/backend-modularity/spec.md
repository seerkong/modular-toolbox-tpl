## MODIFIED Requirements
### Requirement: Backend layered packages
Backend SHALL provide three bun packages: `@backend/core` (framework-agnostic business contracts/helpers), `@backend/mediator` (DI + ORM-backed service implementations without transport deps), and transport shells that depend on mediator but not vice versa (`@backend/elysia-shell` and `@backend/koa-shell`).

#### Scenario: Package boundaries enforced
- **WHEN** building or adding backend modules
- **THEN** core exports contain no DI/ORM/server imports, mediator uses DI/ORM but no Elysia/Koa imports, and Elysia/Koa shells only call mediator/public contracts.

### Requirement: Backend package-root import aliases
Backend packages SHALL provide aliases from each package `src/` root (e.g., `@backend/mediator/*`, `@backend/core/*`, `@backend/elysia-shell/*`, `@backend/koa-shell/*`) so shared infra/helpers can be imported without deep relative paths, while keeping same-module relative imports optional.

#### Scenario: Import backend infra without deep relatives
- **WHEN** a mediator endpoint or service imports shared infra (e.g., logging, http contracts) from outside its module
- **THEN** the import uses the package-root alias (e.g., `@backend/mediator/infra/logging`) instead of relative paths like `../../../../infra/logging`, and bun/tsconfig resolution works in build and test.

## ADDED Requirements
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
