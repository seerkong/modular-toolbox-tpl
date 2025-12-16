## Context
Embedded desktop WebView blocks native `alert`/`confirm`, and the project currently mixes ad-hoc `showToast` helpers and direct native calls. We need consistent, shell-local UI primitives that work in both Vue and React without introducing new global dependencies.

## Goals / Non-Goals
- Goals: Provide toast + confirm/alert UI backed by components; expose simple helper functions; remove native dialog usage; surface execution results in Admin Assign flows.
- Non-Goals: Introduce new UI libraries or cross-shell shared UI package; redesign existing pages beyond feedback plumbing.

## Decisions
- Implement per-shell lightweight components in `src/components` that render into a shared container (portal/div) to avoid coupling with page layout.
- Expose promise-based helpers (`toast`, `alertDialog`, `confirmDialog`) that wrap component state so call sites retain native-like ergonomics.
- Keep styling minimal/reusable and avoid adding external deps; reuse existing CSS variables.

## Risks / Trade-offs
- Need to ensure helpers are initialized early; mitigated by lazy creation of the host container when the first call is made.
- Multiple concurrent calls could clash; mitigate via simple queueing for confirm/alert and stacking for toasts.

## Migration Plan
1) Add components + helpers for Vue and React.
2) Replace existing native dialog usage and ad-hoc `showToast` with new helpers.
3) Add Admin Assign execution result toasts.
4) Smoke test key flows (patch diff pages, admin assign).

## Open Questions
- None identified.
