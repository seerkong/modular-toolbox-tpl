# Change: Refactor frontend router configs into mediator

## Why
Vue and React shells duplicate the same router data and module contracts, forcing parallel updates for every module. Centralizing pure route definitions and module router contracts in the frontend mediator layer reduces drift and lets shells focus only on framework-specific views.

## What Changes
- Move router data (route resources and module route configs) and module-level router contracts into the frontend mediator package for shared consumption.
- Adjust Vue/React routers to load route data from mediator and apply framework-specific component resolution/suffixes while keeping modules’ UI code per framework.
- Update docs/tests to cover the single-source router flow and ensure module scaffolding references the mediator route definitions.

## Impact
- Affected specs: frontend-shell
- Affected code: frontend/packages/mediator (new shared router configs/contracts), frontend/packages/react|vue router builders/resources, module route exports (Example, PrepareDbDataTool), docs/tests referencing module scaffolding.
