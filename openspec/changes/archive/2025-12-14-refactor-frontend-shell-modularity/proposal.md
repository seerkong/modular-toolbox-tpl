# Change: Refactor frontend shells for modular layout and configurable routing

## Why
- Current Vue/React shells are simple demos without configurable layout/routing or reusable module scaffolding, making it hard to clone the app as a configurable toolbox.
- Need a data-driven router/layout pattern (similar to aip-permission/admin) to allow copying the framework and wiring routes from configuration while keeping URL paths visible.
- Want consistent module directory conventions across core, Vue, and React shells to enable copy/paste reuse.

## What Changes
- Introduce configurable layout + routing scaffolds in Vue and React shells modeled after the referenced admin framework (data-driven routes/menus, no UI lib dependencies).
- Add module directory conventions (core + shells) with per-module folders for router, view/components, api, contract/runtime/state/helpers, etc.
- Preserve the existing three themes (crt-amber, crt-green) and limit theme switching to these while adapting the new layout.
- Document how to add modules for core, Vue, and React in `docs/ai-guide`.

## Impact
- Affects frontend packages: `frontend/packages/core`, `frontend/packages/vue`, `frontend/packages/react`.
- Adds new documentation under `docs/ai-guide`.
- Enables future configuration-driven navigation and templated reuse of the frontend framework.
