## ADDED Requirements

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
Frontend routers (Vue and React) SHALL build routes and menus from pure data definitions that can be loaded from config or API, map to readable browser URLs via history mode, and resolve components dynamically without hardcoding component instances in the config.

#### Scenario: Register routes from configuration
- **WHEN** the app loads a route/menu configuration
- **THEN** the router registers routes with visible paths in the browser URL using history mode (hash-only fallback optional), resolves components dynamically (e.g., via path-to-component map or lazy import), and supports marking items as menu-only or external links without requiring component objects in the config payload.

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
