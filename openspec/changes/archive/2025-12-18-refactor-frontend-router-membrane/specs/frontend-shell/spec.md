## ADDED Requirements
### Requirement: Centralize router configs and contracts in frontend mediator
Frontend router data and module router contracts SHALL live in the frontend mediator package so Vue and React shells consume a single source of truth.

#### Scenario: Share module route configs
- **WHEN** a module adds or updates route definitions
- **THEN** the route config is defined under `frontend/packages/mediator/src/modules/<module>/router/` with extensionless component paths, and both Vue and React shells import that config instead of maintaining separate copies.

#### Scenario: Share router contracts
- **WHEN** a module needs router-related types/contracts
- **THEN** its `contract/` definitions live alongside the shared router config in the mediator module, and shells import from mediator rather than duplicating per framework.

## MODIFIED Requirements
### Requirement: Configurable data-driven routing
Frontend routers (Vue and React) SHALL build routes and menus from pure data definitions that can be loaded from config or API, map to readable browser URLs via history mode, and resolve components dynamically without hardcoding component instances in the config, using a shared mediator source for route data.

#### Scenario: Register routes from configuration
- **WHEN** the app loads a route/menu configuration
- **THEN** the router registers routes with visible paths in the browser URL using history mode (hash-only fallback optional), resolves components dynamically (e.g., via path-to-component map or lazy import) with framework-specific extension resolution from shared extensionless component paths, and supports marking items as menu-only or external links without requiring component objects in the config payload.
