# frontend-ui-feedback Specification

## Purpose
TBD - created by archiving change add-webview-dialog-fallbacks. Update Purpose after archive.
## Requirements
### Requirement: Frontend Dialog Prohibition Guideline
The system SHALL document AI-facing frontend module rules that forbid using native dialog APIs (`alert`/`confirm`/`prompt`) and direct developers to the custom feedback primitives.

#### Scenario: AI guideline available
- **WHEN** contributors reference `docs/ai-guide/rules/frontend_module_dev_rules.md`
- **THEN** they can find rule `frontend-api-0001` (`frontend-api-deny-use-alert-confirm-etc`) describing the prohibition of native dialogs and the required use of custom helpers.

