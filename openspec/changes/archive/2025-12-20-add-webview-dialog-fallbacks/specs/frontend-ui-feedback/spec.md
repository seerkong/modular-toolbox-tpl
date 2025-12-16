## ADDED Requirements
### Requirement: Custom UI Feedback Primitives
The system SHALL provide custom toast, alert, and confirm UI primitives for both Vue and React shells that do not rely on browser-native dialogs and operate in the desktop WebView context.

#### Scenario: Render feedback without native dialogs
- **WHEN** frontend code invokes toast/alert/confirm via exported helpers from `frontend/packages/<shell>/src/components`
- **THEN** the shell renders the corresponding UI inside the app using the custom components and the user can respond without relying on browser dialogs.

### Requirement: Legacy Dialog Usage Eliminated
The system SHALL replace existing usages of `alert`/`confirm` and ad-hoc toast helpers with the new primitives across Vue and React modules.

### Requirement: Admin Assign Execution Feedback
The system SHALL display toast notifications using the new primitives to indicate success or failure after Admin Assign single or batch executions in both Vue and React shells.

#### Scenario: Single execution feedback
- **WHEN** a user triggers Admin Assign single execution and it succeeds or fails
- **THEN** the page shows a toast describing the success or failure outcome via the custom toast helper.

#### Scenario: Batch execution feedback
- **WHEN** a user triggers Admin Assign batch execution and it completes or errors
- **THEN** the page shows a toast describing the success or failure outcome via the custom toast helper.

## ADDED Requirements
### Requirement: Frontend Dialog Prohibition Guideline
The system SHALL document AI-facing frontend module rules that forbid using native dialog APIs (`alert`/`confirm`/`prompt`) and direct developers to the custom feedback primitives.

#### Scenario: AI guideline available
- **WHEN** contributors reference `docs/ai-guide/rules/frontend_module_dev_rules.md`
- **THEN** they can find rule `frontend-api-0001` (`frontend-api-deny-use-alert-confirm-etc`) describing the prohibition of native dialogs and the required use of custom helpers.
