## 1. Foundations
- [x] 1.1 Introduce module directory scaffolding in `frontend/packages/core` (modules/<module>/contract|controller|container|runtime|state|api|helper, etc.) without business logic.
- [x] 1.2 Introduce parallel module scaffolding in `frontend/packages/vue` (modules/<module>/router|index.ts|view|component|api|styles|hooks|contract|helper, etc.).
- [x] 1.3 Introduce parallel module scaffolding in `frontend/packages/react` (modules/<module>/router|index.ts|view|component|api|styles|hooks|contract|helper, etc.).

## 2. Layout and routing framework
- [x] 2.1 Add reusable layout shell for Vue inspired by `aip-permission/admin` (no element-plus), wired for configurable menus/routes and URL-visible paths.
- [x] 2.2 Add reusable layout shell for React with the same configurable routing/menu model.
- [x] 2.3 Implement config-driven router builders in Vue and React (data-only route definitions → router registration) to enable loading from config/API.

## 3. Theming
- [x] 3.1 Adapt new layouts to honor existing three themes (`crt-amber`, `crt-green`) and keep theme switching constrained to these.

## 4. Docs and validation
- [x] 4.1 Add guides `HowAddModuleToFrontendCore.md`, `HowAddModuleToFrontendVue.md`, `HowAddModuleToFrontendReact.md` under `docs/ai-guide`.
- [x] 4.2 Update any README/notes if needed to point to the new scaffolding (optional).
- [x] 4.3 Validate build/test paths touched: frontend builds (`bun run build:frontend:vue|react`) and core tests (`bun run test:frontend`).
