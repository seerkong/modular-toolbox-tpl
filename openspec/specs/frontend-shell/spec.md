# frontend-shell Specification

## Purpose
TBD - created by archiving change refactor-frontend-shell-modularity. Update Purpose after archive.
## Requirements
### Requirement: Module scaffolding for frontend shells
Vue and React shells SHALL provide a `modules/<name>/` structure (router, index.ts, view/, component/, api/, styles/, hooks/, contract/, helper/ folders) so modules can be copied or added without touching the shell root.

#### Scenario: Create new UI module
- **WHEN** a new frontend module is added
- **THEN** its assets are placed under `modules/<name>/` with router/config entry points (`router/`, `index.ts`) and supporting folders (`view/`, `component/`, `api/`, `styles/`, `hooks/`, `contract/`, `helper/`) so it can be packaged or reused independently of other modules.

### Requirement: Module scaffolding for frontend core
The shared core package SHALL expose a `modules/<name>/` structure (contract/, controller/, container/, runtime/, state/, api/, helper/ folders) for module-level types and wiring that Vue/React can consume without embedding UI logic.

#### Scenario: Define shared types for a module
- **WHEN** a module needs to expose shared runtime/state/api helpers
- **THEN** the definitions live in `frontend/packages/core/modules/<name>/` under contract/controller/container/runtime/state/api/helper, making them importable by both Vue and React shells without UI coupling.

### Requirement: Configurable data-driven routing
Frontend routers (Vue and React) SHALL build routes and menus from pure data definitions that can be loaded from config or API, map to readable browser URLs via history mode, and resolve components dynamically without hardcoding component instances in the config, using a shared mediator source for route data.

#### Scenario: Register routes from configuration
- **WHEN** the app loads a route/menu configuration
- **THEN** the router registers routes with visible paths in the browser URL using history mode (hash-only fallback optional), resolves components dynamically (e.g., via path-to-component map or lazy import) with framework-specific extension resolution from shared extensionless component paths, and supports marking items as menu-only or external links without requiring component objects in the config payload.

### Requirement: Layout compatible with existing themes
The new layout framework SHALL honor the existing three themes (`crt-amber`, `crt-green`) and keep theme switching constrained to these options.

#### Scenario: Toggle theme in new layout
- **WHEN** a user switches the theme in the new layout
- **THEN** the layout and menus restyle using the selected theme while limiting choices to `crt-amber`, or `crt-green`, and existing stored theme keys continue to work.

### Requirement: Module authoring guides
Documentation SHALL describe how to add modules to the core, Vue shell, and React shell, including required folders/files and how to register routes/config.

#### Scenario: Provide module how-to guides
- **WHEN** a developer looks for instructions
- **THEN** guides exist at `docs/ai-guide/HowAddModuleToFrontendCore.md`, `docs/ai-guide/HowAddModuleToFrontendVue.md`, and `docs/ai-guide/HowAddModuleToFrontendReact.md` explaining folder conventions and registration steps.

### Requirement: Centralize router configs and contracts in frontend mediator
Frontend router data and module router contracts SHALL live in the frontend mediator package so Vue and React shells consume a single source of truth.

#### Scenario: Share module route configs
- **WHEN** a module adds or updates route definitions
- **THEN** the route config is defined under `frontend/packages/mediator/src/modules/<module>/router/` with extensionless component paths, and both Vue and React shells import that config instead of maintaining separate copies.

#### Scenario: Share router contracts
- **WHEN** a module needs router-related types/contracts
- **THEN** its `contract/` definitions live alongside the shared router config in the mediator module, and shells import from mediator rather than duplicating per framework.

### Requirement: Shared static assets for frontend shells
Shared static assets SHALL live in `frontend/static/` and be automatically mirrored into each shell's `public/` directory for development and build outputs, eliminating per-shell duplication.

#### Scenario: Sync static assets for dev servers
- **WHEN** a developer starts `bun run dev:vue` or `bun run dev:react` (directly or via the root scripts)
- **THEN** the contents of `frontend/static/` are copied into `frontend/packages/<shell>/public/` before Vite serves files, preserving relative paths such as `/crt/<file>`, so no manual copy is needed per shell.

#### Scenario: Include shared assets in shell builds
- **WHEN** `bun run build:vue` or `bun run build:react` runs (including through root build commands)
- **THEN** the static assets from `frontend/static/` are present in each shell's `public/` for the build and appear in the final build output with the same URLs (e.g., `/crt/<file>`).

### Requirement: Frontend package-root import aliases
Frontend packages SHALL expose aliases from each shell/core/mediator `src/` root (e.g., `@frontend/react/*`, `@frontend/vue/*`, `@frontend/core/*`, `@frontend/mediator/*`) so shared infra/helpers are imported without deep relatives; same-module imports may stay relative for portability.

#### Scenario: Import frontend helpers without deep relatives
- **WHEN** a React or Vue shell module imports shared helpers or hooks outside its module
- **THEN** it uses the package-root alias (e.g., `@frontend/react/hooks/useTheme`) rather than paths like `../../hooks/useTheme`, and Vite/tsconfig resolution works in dev and build.

