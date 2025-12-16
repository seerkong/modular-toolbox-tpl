## Context
- Goal: turn the frontend (Vue + React) into a configurable, template-friendly shell with data-driven routing/layout (layout, i18n, router patterns) while preserving existing three themes.
- Current state: simple single-page shells with manual routing, minimal structure, and theme switcher for `crt-amber`, `crt-green`. No module scaffolding; core exposes APIs/types without module folders.
- Constraints: avoid adopting element-plus or heavy UI libs; keep theme switch limited to existing three themes; router should expose URL paths (not hidden hash-only menus) and be config-loadable (routes as pure data).

## Goals / Non-Goals
- Goals: (1) add module folder conventions for core + shells; (2) add configurable layout + router builders (Vue/React) with data-only route definitions; (3) keep theme support aligned with existing three themes; (4) document how to add modules.
- Non-Goals: implement business modules; change backend APIs; redesign themes beyond aligning layout styles.

## Decisions
- Routing model: adopt data-driven route definitions similar to the reference project’s resolver—pure data objects mapped to router registration (no direct component refs in config; dynamic lookup/import).
- Layout: build lightweight layout (header/aside/content) patterned on the reference, but implemented with project’s own styles to fit existing themes.
- Module structure: create `modules/<name>/...` in core and shells to encapsulate router, views, api, contracts, runtime/state/helpers per module; keep core focused on shared runtime/types/controllers without UI specifics.
- Router history mode: use history mode (no hash) by default so menu paths stay visible in URLs; optionally allow hash fallback only if deployment demands it.

## Risks / Trade-offs
- Risk: New layout may diverge from existing theme aesthetics; mitigation is to map colors/spacing to current theme tokens and keep theme toggle limited to the three options.
- Risk: Data-driven router needs guardrails for lazy imports and error handling; mitigate with loader fallbacks and validation when registering routes.
- Risk: Copying patterns from reference could introduce hidden dependencies (e.g., store/i18n expectations); mitigate by stubbing minimal equivalents and documenting extension points.

## Migration Plan
- Add scaffolding + layout/routing frameworks without breaking current entrypoints; migrate demo routes to new system.
- Keep theme keys the same so existing localStorage entries continue to work.
- Provide docs for adding modules; incremental adoption for future modules.

## Open Questions
- Should route/menu configuration be loaded from static config files or API responses by default? (Plan: support static config with option to plug in API fetch later.)
