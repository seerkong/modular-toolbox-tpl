# Change: Share frontend static assets

## Why
- Vue and React shells duplicate the same public assets, forcing manual copies and risking drift whenever a shared image or file changes.

## What Changes
- Add a shared `frontend/static/` directory as the single source for static assets that belong in both shells.
- Introduce tooling to sync `frontend/static/` into `frontend/packages/vue/public/` and `frontend/packages/react/public/` for both dev and build workflows.
- Migrate the existing CRT assets to the shared static directory and document the new workflow.

## Impact
- Affected specs: frontend-shell
- Affected code: frontend static assets, Vue/React Vite configs or build scripts, developer docs for static assets
