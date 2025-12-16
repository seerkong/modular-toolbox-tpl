## ADDED Requirements

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
