# prepare-db-data-tool Specification

## Purpose
TBD - created by archiving change add-prepare-db-data-tool. Update Purpose after archive.
## Requirements
### Requirement: Manage MySQL connection profiles
PrepareDbDataTool SHALL let users CRUD MySQL connection profiles, mark one active, and test connectivity before use.

#### Scenario: List and refresh profiles first
- **WHEN** the Database Connection view loads
- **THEN** saved profiles appear above the form with `新建` and `刷新列表` controls that reload the list without hiding it, and `新建` clears the form for a new entry.

#### Scenario: Create or edit via form with dual save buttons
- **WHEN** the user fills host, port, username, password, and database in the form beneath the list and clicks either save button (above or below)
- **THEN** the profile is created or updated in SQLite and the refreshed list remains visible above the form.

#### Scenario: Delete from list row
- **WHEN** the user clicks `删除` on a profile row
- **THEN** the profile (and related table/mock profiles) is removed from SQLite and the list refreshes.

#### Scenario: Choose active database
- **WHEN** the user selects a profile as active
- **THEN** the selection is stored and used for schema fetch and insert actions, and the UI shows the active state.

#### Scenario: Test connection
- **WHEN** the user clicks to test a profile’s connectivity
- **THEN** the backend attempts a MySQL connection with the provided credentials and returns success or error details without persisting invalid profiles unless requested.

### Requirement: Fetch and classify table schema
The system SHALL fetch table schemas for the active/selected profile (allowing `$` in names) and classify columns for mock setup.

#### Scenario: Pull columns for a table name with `$`
- **WHEN** the user requests a schema for a table name that may contain `$` or via a saved table profile id
- **THEN** the backend resolves the table/profile/database, queries MySQL, and returns column metadata including name, raw type, primary flag, and classification or a clear error if missing.

#### Scenario: Classify columns
- **WHEN** schema metadata is processed
- **THEN** columns are classified as string, number, or unsupported based on type mapping for downstream mock selection.

### Requirement: Configure and reuse table mock profiles
Users SHALL manage table mock profiles in a list-first view, configure field mocks per column, and reuse compatible profiles.

#### Scenario: List and refresh table profiles first
- **WHEN** the Schema 管理 view opens
- **THEN** saved table profiles render at the top with `新建`/`刷新列表`, and refresh re-queries the backend while new clears selection and prepares the form below.

#### Scenario: Edit, delete, or configure fields from a row
- **WHEN** the user clicks `编辑`, `删除`, or `配置fields` on a profile row
- **THEN** edit loads its metadata into the form beneath the list, delete removes it and refreshes the list, and configure fetches the schema + shows the field form for that profile/table.

#### Scenario: Persist profile for a table
- **WHEN** every field has a selected kind/type and the user saves the profile form
- **THEN** the configuration is stored per table + DB profile, completion status is updated, and the list refreshes with the latest state.

#### Scenario: Apply saved profile to a new schema fetch
- **WHEN** a saved profile is applied to a freshly fetched schema
- **THEN** only matching fields (same column name and string/number classification) are pre-filled; others stay unset.

#### Scenario: Reapply fields from another profile
- **WHEN** the user clicks `复用其他profile` and selects a different table profile while editing a table
- **THEN** matching fields are copied into the current configuration, overwriting kind/type/order for those fields while leaving non-matching fields untouched.

### Requirement: Provide mock options per field type
Field configuration SHALL expose the defined mock kinds/types for string and number columns with correct generation semantics, including saved custom lists.

#### Scenario: Present string mock options
- **WHEN** editing a string-classified field
- **THEN** the user can choose one kind/type from `IdGenerator:{ULID,UUID,SnowflakeId}`, `SequenceIn:{BuiltinPersonList,BuiltinDepartmentList,<custom string lists>}`, `RandomIn:{BuiltinPersonList,BuiltinDepartmentList,<custom string lists>}`, or `Default:{DbDefault,Null}`.

#### Scenario: Present number mock options
- **WHEN** editing a number-classified field
- **THEN** the user can choose one kind/type from `IdGenerator:{AutoIncrement,SnowflakeId}`, `SequenceIn:{BuiltinNumIdList,<custom number lists>}`, `RandomIn:{BuiltinNumIdList,<custom number lists>}`, `TimeGenerator:{TimestampSeconds,TimestampMillis}`, or `Default:{DbDefault,Null,const_0,const_1}`.

### Requirement: Enforce readiness before preview or execute
Preview and execute actions SHALL remain disabled until required selections/profiles are complete.

#### Scenario: Validate readiness
- **WHEN** no active DB, table selection, or fully configured table profile is present
- **THEN** preview/execute actions are disabled and the UI surfaces what is missing.

### Requirement: Preview and execute batched inserts with streaming progress (WebSocket)
The system SHALL preview the first batch of INSERT statements and execute batched inserts asynchronously with cancellation and streamed progress/log events delivered over WebSocket.

#### Scenario: Show first batch insert
- **WHEN** the user requests a preview with valid inputs and profile
- **THEN** the backend returns formatted INSERT statement(s) for the first batch only without altering the run progress log.

#### Scenario: Run inserts with progress
- **WHEN** the user starts execution
- **THEN** the backend runs inserts in configured batch sizes, skips insert for `AutoIncrement`/`DbDefault` columns, and emits progress including batch counts and errors.

#### Scenario: Cancel running insert
- **WHEN** an insert task is in progress and the user requests cancellation
- **THEN** the task is marked cancelled promptly and no further batches run.

#### Scenario: Debug panel updates
- **WHEN** progress/events are streamed over WebSocket
- **THEN** the UI keeps a sticky progress summary and appends log messages, auto-scrolling while capping log history to recent entries.

### Requirement: Provide Vue and React shells
The PrepareDbDataTool module SHALL be available in both Vue and React shells with equivalent list-first flows for DB profiles, schema management, and insert preview/execute using WebSocket progress.

#### Scenario: Vue shell routes and views
- **WHEN** the Vue shell loads the module
- **THEN** routes/menus register via data-driven config, and the three views (DB profiles, Schema 管理, Insert) present the list-first interactions and WebSocket-driven progress panel.

#### Scenario: React shell routes and views
- **WHEN** the React shell loads the module
- **THEN** routes/menus register via data-driven config, and the three views (DB profiles, Schema 管理, Insert) present the same list-first interactions and WebSocket-driven progress panel as Vue.

### Requirement: Core API Unit Tests
The system SHALL provide unit tests for PrepareDbDataApiImpl that verify HTTP request construction and response handling without requiring a live backend.

#### Scenario: Profile operations are testable
- **WHEN** a test creates a mock HttpClient returning valid ApiResponse
- **THEN** PrepareDbDataApiImpl methods (listProfiles, createProfile, updateProfile, deleteProfile, activateProfile, testConnection) SHALL correctly construct requests and unwrap responses

#### Scenario: Schema operations are testable
- **WHEN** a test calls fetchSchema with mock HttpClient
- **THEN** the API SHALL correctly POST the schema request and extract columns from the nested response

#### Scenario: Table profile operations are testable
- **WHEN** a test calls table profile methods with mock HttpClient
- **THEN** the API SHALL correctly construct requests for listTableProfiles, getTableProfile, saveTableProfile, applyTableProfile, and deleteTableProfile

#### Scenario: Insert operations are testable
- **WHEN** a test calls previewInsert, executeInsert, cancelTask, or getTask with mock HttpClient
- **THEN** the API SHALL correctly construct requests and handle responses including taskId extraction

#### Scenario: Error handling is testable
- **WHEN** a test provides an error response (code != 0 or ok = false)
- **THEN** the unwrap method SHALL throw an Error with the appropriate message

### Requirement: Mediator Controller Unit Tests
The system SHALL provide unit tests for PrepareDbDataController that verify it correctly delegates to the underlying API.

#### Scenario: Controller delegates profile listing
- **WHEN** a test calls controller.listProfiles with mock API
- **THEN** the controller SHALL call api.listProfiles with the provided runtime

#### Scenario: Controller delegates table profile listing
- **WHEN** a test calls controller.listTableProfiles with optional dbProfileId
- **THEN** the controller SHALL call api.listTableProfiles with the same arguments

#### Scenario: Controller delegates preview
- **WHEN** a test calls controller.preview with a payload
- **THEN** the controller SHALL call api.previewInsert with the same runtime and payload

#### Scenario: Controller delegates execute
- **WHEN** a test calls controller.execute with a payload
- **THEN** the controller SHALL call api.executeInsert and return the taskId

#### Scenario: Controller delegates progress subscription
- **WHEN** a test calls controller.subscribeProgress with an event handler
- **THEN** the controller SHALL call api.connectProgressSocket with the same arguments

### Requirement: Manage custom mock value lists
PrepareDbDataTool SHALL let users create, view, and delete named custom value lists (string or number) imported from CSV so they can be reused across table profiles.

#### Scenario: Import list from CSV
- **WHEN** the user opens the PrepareDbDataTool "自定义列表" view in either shell, selects list type (string/number), provides a name, and uploads a single-column CSV with values
- **THEN** the system parses the first column (skipping empty rows and optional header), rejects invalid number rows, persists the list in SQLite with item count, and shows the saved entry in the list.

#### Scenario: List and delete saved lists
- **WHEN** the custom list view loads or after a new list is saved
- **THEN** existing lists display with name, type, and item count, and the user can delete a list to remove it from SQLite and from subsequent field dropdown options.

#### Scenario: Guard against empty/invalid import
- **WHEN** the uploaded CSV has no valid rows or contains non-numeric values for a number list
- **THEN** the system surfaces a validation error and does not create the list.

### Requirement: Use custom lists in field configuration
Field mock configuration SHALL allow SequenceIn/RandomIn kinds to reference saved custom lists filtered by column type, and preserve the selection in table profiles.

#### Scenario: Select custom string list
- **WHEN** editing a string-classified column and choosing SequenceIn or RandomIn
- **THEN** the Type dropdown includes both built-in options and saved string lists (labeled by name), and saving/re-opening the profile keeps the chosen custom list.

#### Scenario: Select custom number list
- **WHEN** editing a number-classified column and choosing SequenceIn or RandomIn
- **THEN** the Type dropdown includes the built-in number list and saved number lists, and saved profiles restore the selected custom list when applied to matching schemas.

### Requirement: Generate values from custom lists
Preview and execute flows SHALL generate SequenceIn/RandomIn values from the selected custom list and fail fast with clear errors when the referenced list is missing.

#### Scenario: Generate from saved list or fail clearly
- **WHEN** a field uses SequenceIn/RandomIn with a custom list and preview/execute runs
- **THEN** values come from the saved list (cycling sequentially or randomly as chosen), and if the list is missing or empty the operation returns a descriptive error instead of inserting rows.

