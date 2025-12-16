## Context
Vue and React shells each carry identical route resources and module router configs (e.g., Example, PrepareDbDataTool) plus ad-hoc contracts. This duplication causes drift and doubles effort when adding modules. Mediator already hosts shared DI and controllers; it should also host router data contracts to keep shells thin.

## Goals / Non-Goals
- Goals: single source of router data and module router contracts in `frontend/packages/mediator`; shells load this data and only supply framework-specific view components/extensions.
- Non-Goals: change route hierarchy/behavior, add new modules, or modify runtime router features beyond source-of-truth refactor.

## Decisions
- Shared location: create mediator `router/` (types/resources) and module route configs under `frontend/packages/mediator/src/modules/<module>/router/`.
- Component resolution: store component paths without framework-specific extensions (e.g., `modules/Example/view/ExamplePost`); Vue builder appends `.vue`, React builder appends `.tsx|.ts|.jsx` via glob lookup with fallback.
- Contracts: move module `contract/` folders to mediator so shells import types from mediator instead of duplicating per shell.
- Shell adapters: Vue/React `routeResources` files become thin re-exports from mediator; builders accept shared data and map component paths through a resolver that appends the right extension.

## Risks / Trade-offs
- Component resolution ambiguity if both `.tsx` and `.ts` exist; mitigate by deterministic extension preference (documented in builder).
- Path breakage during migration; need unit tests to ensure shared configs resolve in both shells.

## Migration Plan
1) Add shared router types/resources and module route configs/contracts in mediator (using extensionless component paths).
2) Update Vue/React builders to resolve components with framework-specific suffixes and consume mediator data.
3) Remove shell duplicates, fix imports/exports, and update docs/tests.
