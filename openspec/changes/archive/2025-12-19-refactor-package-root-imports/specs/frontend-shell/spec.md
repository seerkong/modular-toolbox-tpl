## ADDED Requirements
### Requirement: Frontend package-root import aliases
Frontend packages SHALL expose aliases from each shell/core/mediator `src/` root (e.g., `@frontend/react/*`, `@frontend/vue/*`, `@frontend/core/*`, `@frontend/mediator/*`) so shared infra/helpers are imported without deep relatives; same-module imports may stay relative for portability.

#### Scenario: Import frontend helpers without deep relatives
- **WHEN** a React or Vue shell module imports shared helpers or hooks outside its module
- **THEN** it uses the package-root alias (e.g., `@frontend/react/hooks/useTheme`) rather than paths like `../../hooks/useTheme`, and Vite/tsconfig resolution works in dev and build.
